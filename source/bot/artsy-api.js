// @flow

import fetch from "node-fetch"
import type { GraphQLQuery, MitosisUser } from "./types"
import { ARTSY_API_CLIENT, ARTSY_API_SECRET, GRAVITY_URL, METAPHYSICS_URL } from "../globals"

/** Represents the URL to start the auth flow */
export const oauthLoginURL = (redirect: string) => `${GRAVITY_URL}/oauth2/authorize?client_id=${ARTSY_API_CLIENT}&redirect_uri=${redirect}&response_type=code`

// These are collated for you Joey

export const GravityTrendingArtistsAPI = "/api/v1/artists/trending"
export const GravityEmergingArtistsAPI = "/api/v1/artists/emerging"

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
  if (user.xappToken !== undefined) {
    return { "X-Xapp-Token": user.xappToken }
  }
  console.warn(`Error generating header params for ${user.fbSenderID}`)
}

/**
 * Gets an Artsy XApp token
 * @returns {Promise<any>} json representation from gravity
 */

export async function getXappToken(): Promise<any> {
  const path = "/api/v1/xapp_token"
  const clientAndSecret = `client_id=${ARTSY_API_CLIENT}&client_secret=${ARTSY_API_SECRET}`
  return fetch(`${GRAVITY_URL}${path}?${clientAndSecret}`, {
    method: "GET"
  })
  .then(checkStatus)
  .then(parseJSON)
}

/**
 * Creates a query to metaphysics, returns the JSON data
 *
 * @param {string} query the request
 * @returns {Promise<any>}
 */
export function metaphysicsQuery(query: GraphQLQuery, user: MitosisUser): Promise<any> {
  return fetch(`${METAPHYSICS_URL}?query=${encodeURIComponent(query)}`, {
    method: "GET",
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
export function gravityPost(body: any = {}, path: string, user: MitosisUser): Promise<any> {
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
export function gravity(path: string, user: MitosisUser): Promise<any> {
  return fetch(`${GRAVITY_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...headerAuthParams(user) }
  })
  .then(checkStatus)
  .then(parseJSON)
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
