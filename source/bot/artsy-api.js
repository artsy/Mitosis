// @flow

import fetch from "node-fetch"
import type { GraphQLQuery, APIToken } from "./types"
import { GRAVITY_URL } from "../globals"

/**
 * Creates a query to metaphysics, returns the JSON data
 *
 * @param {string} query the request
 * @returns {Promise<any>}
 */
export function metaphysicsQuery(query: GraphQLQuery, apiToken: APIToken): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    resolve({
      id: "ryohei-usui-ennui",
      title: "Ennui",
      href: "/artwork/ryohei-usui-ennui",
      description: "Ed Ruscha defies categorization with his diverse output of photographic books and tongue-in-cheek photo-collages, paintings, and drawings. Insects as a subject evoke both Dadaist and Surrealistic tendencies, and the physical environment of the artist's studio. Why insects? \"Because I have a jillion cockroaches around my studio. I love them, but I don’t want them around.\"",
      images: [{
        id: "5820f5ef9a3cdd58ca00060e",
        url: "https://d32dm0rphc51dk.cloudfront.net/jPpFqKJywfT_g5f81BB-JQ/normalized.jpg"
      }]
    })
  })
}

/**
 * Runs a query against gravity, e.g. favouriting an Artwork
 *
 * @export
 * @param  {any} body
 * @param {APIToken} apiToken
 * @returns {Promise<any>}
 */
export function gravityPost(body: any = {}, path: string, apiToken: APIToken): Promise<any> {
  return fetch(`${GRAVITY_URL}/api/v1/${path}?access_token=${apiToken}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
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
