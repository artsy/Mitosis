// @flow

import type { $Request, $Response } from "express"
import { VALIDATION_TOKEN } from "../globals"

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

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
export function authorise(req: $Request, res: $Response) {
  var accountLinkingToken = req.query.account_linking_token
  var redirectURI = req.query.redirect_uri

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = "1234567890"

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode

  res.render("authorize", {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  })
}
