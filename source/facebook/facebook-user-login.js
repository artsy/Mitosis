// @flow

import type { $Request, $Response } from "express"
import { VALIDATION_TOKEN, BOT_SERVER_URL } from "../globals"
import { randomBytes } from "crypto"
import { fbapi } from "../facebook/api"
import {
  getOrCreateArtsyLookup,
  updateArtsyLookup,
  getAndDeleteArtsyLookup,
  getOrCreateMitosisUser,
  updateMitosisUser
} from "../db/mongo"
import { oauthLoginURL, gravity, GravityMeAPI } from "../bot/artsy-api"
import { Cities } from "places"

export function validation(req: $Request, res: $Response) {
  if (req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === VALIDATION_TOKEN) {
    console.log("Validating webhook")
    res.status(200).send(req.query["hub.challenge"])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.")
    res.sendStatus(403)
  }
}

// Sorry reader, authentication is a tricky tricky beast.
// Facebook don't want to give us any user creds until everything
// is confirmed, so we have to jump through hoops.
//
// Here's what happens:
//
// A user requests a "login" button, this goes to facebook, who then
// redirect the user to `authoriseFacebook` in a web-browser.
//
// FB gives a param for `redirect_uri` which is the URL we need to send
// to FB to confirm everything happened at the end.
//
// We auto-redirect users from `authoriseFacebook` to an Artsy Oauth URL,
// this cannot be the messenger.com `redirect_uri` because we need to keep track
// of the request ID. So, the Artsy Oauth flow redirects to `authoriseArtsy`
// in the browser.
//
// `authoriseArtsy` then takes the Artsy Oauth token, and the request ID, stores
// them together in the lookup db, and redirects to the original `redirect_uri`.
//
// This tells Facebook we're done authenticating, once that is all confirmed
// we are sent a webhook notification that the accounts are linked, this is
// what `receivedAccountLink` recieves.
//
// It takes the app link request ID and looks up the auth in the lookup db,
// if it is successful, then it deletes it and sets the OAuth token on the mitosis
// user account and we are done. Phew.

// We're using this auth flow:
// https://github.com/artsy/gravity/blob/master/doc/ApiAuthentication.md#login-using-oauth-web-browser-redirects

// An express route for initially setting up authorization
export async function authoriseFacebook(req: $Request, res: $Response) {
  // Facebook's user token for the authentication setup
  // we do not get access to the messenger UUID until everything
  // is confirmed, so we need to keep track

  var accountLinkingToken = req.query.account_linking_token
  var redirectURI = req.query.redirect_uri
  var requestID = randomBytes(20).toString("hex")

  // Create this for now, we will need it later when we get an
  // Auth token back from Artsy
  const newLookup = {
    requestID,
    accountLinkingToken,
    redirectURI
  }
  await getOrCreateArtsyLookup(newLookup)

  // Redirect users to this URI on successful login
  const redirect = `${BOT_SERVER_URL}authorize-artsy?requestID=${requestID}`
  const artsyURL = oauthLoginURL(redirect)

  res.redirect(artsyURL)
}

// An express route for recieving the Arty Oauth results, storing them
// then passing a user forwards to messenger.com
export async function authoriseArtsy(req: $Request, res: $Response) {
  // Facebook's user token for the authentication setup
  // we do not get access to the messenger UUID until everything
  // is confirmed, so we need to keep track

  const requestID = req.query.requestID

  // This returns a code, which we can turn into a token whenever we want
  const oauthCode = req.query.code
  // Store it so we can generate access tokens on the next gravity request
  const creds = await getOrCreateArtsyLookup({ requestID })
  creds.artsyOauthAppCode = oauthCode
  await updateArtsyLookup(creds)

  // Redirect users to this URI on successful login
  var redirectURISuccess = creds.redirectURI + "&authorization_code=" + requestID
  res.redirect(redirectURISuccess)
}

/*
 * Account Link Event from the webhook
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
export async function receivedAccountLink(event: any) {
  var senderID = event.sender.id

  var status = event.account_linking.status
  var authCode = event.account_linking.authorization_code

  fbapi.startTyping(senderID)

  const lookup = await getAndDeleteArtsyLookup({ requestID: authCode })
  const mitosisUser = await getOrCreateMitosisUser(senderID)

  mitosisUser.artsyOauthAppCode = lookup.artsyOauthAppCode

  const artsyMe = await gravity(GravityMeAPI, mitosisUser)
  // Use the /me API to figure out if they are in a big city, store that
  // for doing local shows
  if (artsyMe.location.city.length !== 0) {
    const citySlug: string = artsyMe.location.city.toLowerCase().replace(" ", "-")
    const maybeCity: ?any = Cities.find((c) => c.slug === citySlug)
    if (maybeCity) {
      mitosisUser.artsyLocationCitySlug = maybeCity.slug
    }
  }

  await updateMitosisUser(mitosisUser)

  fbapi.sendTextMessage(senderID, "OK - connected to Artsy!")
  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode)
}
