// @flow

import fetch from "node-fetch"
import { ARTSY_API_CLIENT, ARTSY_API_SECRET, GRAVITY_URL, METAPHYSICS_URL } from "../globals"

import jwt from "jsonwebtoken"

import { updateMitosisUser } from "../db/mongo"
const querystring = require("querystring")
import type { GraphQLQuery, MitosisUser } from "./types"

/** Represents the URL to start the auth flow */
export const oauthLoginURL = (redirect: string) => `${GRAVITY_URL}/oauth2/authorize?client_id=${ARTSY_API_CLIENT}&redirect_uri=${redirect}&response_type=code`

// These are collated for you Joey

export const GravityTrendingArtistsAPI = "/api/v1/artists/trending"
export const GravityEmergingArtistsAPI = "/api/v1/artists/emerging"
export const GravityAccessTokenAPI = "/oauth2/access_token"
export const GravityXappAPI = "/api/v1/xapp_token"
export const GravityMeAPI = "/api/v1/me"

/**
 * Get the API header creds required to submit API requests
 *
 * @param {MitosisUser} user
 * @returns {*} either an access token header, or xapp token
 */
function headerAuthParams(user: MitosisUser): any {
  if (user.userToken !== undefined) {
    return { "X-Access-Token": user.userToken }
  }
  else if (user.xappToken !== undefined) {
    return { "X-Xapp-Token": user.xappToken }
  } else {
    console.warn(`Error generating header params for ${user.fbSenderID}`)
    return {}
  }
}

/**
 * Updates either the Xapp or OAuth2 token for a user
 * should be called before every Artsy API request
 *
 * @param {MitosisUser} user
 */
async function ensureAuthenticationCredentials(user: MitosisUser) {
  if (isAuthenticationIsUpToDate(user)) { return }

  if (user.artsyOauthAppCode !== undefined) {
    const data = await getOAuthToken(user)
    user.userToken = data.access_token
    await updateMitosisUser(user)
  } else {
    const data = await getXappToken()
    user.xappToken = data.xapp_token
    await updateMitosisUser(user)
  }
}

/**
 * Gets an Artsy XApp token
 * @returns {Promise<any>} json representation from gravity
 */
export async function getXappToken(): Promise<any> {
  const clientAndSecret = `client_id=${ARTSY_API_CLIENT}&client_secret=${ARTSY_API_SECRET}`
  return fetch(`${GRAVITY_URL}${GravityXappAPI}?${clientAndSecret}`)
  .then(checkStatus)
  .then(parseJSON)
}

/**
 * Gets an Artsy Oauth token
 * @returns {Promise<any>} json representation from gravity
 */
export async function getOAuthToken(user: MitosisUser): Promise<any> {
  const oauthCode = user.artsyOauthAppCode
  const query = querystring.stringify({
    client_id: ARTSY_API_CLIENT,
    client_secret: ARTSY_API_SECRET,
    code: oauthCode,
    grant_type: "authorization_code"
  })

  return fetch(`${GRAVITY_URL}${GravityAccessTokenAPI}?${query}`)
  .then(checkStatus)
  .then(parseJSON)
}

/**
 * Creates a query to metaphysics, returns the JSON data
 *
 * @param {string} query the request
 * @returns {Promise<any>}
 */
export async function metaphysicsQuery(query: GraphQLQuery, user: MitosisUser): Promise<any> {
  await ensureAuthenticationCredentials(user)
  return fetch(`${METAPHYSICS_URL}?query=${encodeURIComponent(query)}`, {
    headers: headerAuthParams(user)
  })
  .then(checkStatus)
  .then(parseJSON)
}

/**
 * Runs a query against gravity, e.g. favouriting an Artwork
 *
 * @export
 * @param {any} body
 * @param {APIToken} apiToken
 * @returns {Promise<any>}
 */
export async function gravityPost(body: any = {}, path: string, user: MitosisUser): Promise<any> {
  await ensureAuthenticationCredentials(user)
  return fetch(`${GRAVITY_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headerAuthParams(user) }
  })
  .then(checkStatus)
  .then(parseJSON)
}

/**
 * Gravity get request
 *
 * @export
 * @param {any} body
 * @param {APIToken} apiToken
 * @returns {Promise<any>}
 */
export async function gravity(path: string, user: MitosisUser): Promise<any> {
  await ensureAuthenticationCredentials(user)
  return fetch(`${GRAVITY_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...headerAuthParams(user) }
  })
  .then(checkStatus)
  .then(parseJSON)
}

// Are all the credentials good to go in the DB?
// Looks inside the JWT for the expiration dates.
function isAuthenticationIsUpToDate(user: MitosisUser): bool {
  if (user.artsyOauthAppCode && user.userToken === undefined) {
    // Got a code, but not got user token
    return false
  } else if (user.artsyOauthAppCode && user.userToken) {
    // verify expiration date in JWT for user token
    const options = jwt.decode(user.userToken)
    const now = Math.floor(new Date() / 1000)
    return options.exp > now
  } else if (user.xappToken) {
    // verify expiration date in JWT for xapp
    const options = jwt.decode(user.xappToken)
    const now = Math.floor(new Date() / 1000)
    return options.exp > now
  } else {
    // Not set up yet
    return false
  }
}

// This is duped from the fb stuff
function checkStatus(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    response.json().then(json => {
      console.error("\n\nResponse from Gravity error:")
      console.error(JSON.stringify(json))
    })
    var error = new NetworkError(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response: any) {
  return response.json()
}

/**
 * An Error type with an attached network response
 *
 * @extends {Error}
 */
export class NetworkError extends Error {
  response: any
}
