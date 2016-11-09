// @flow

import { callbackForFavouritingArtwork } from "./contexts/artworks"

/**
 * Handles passing postbacks around the system
 *
 * @param {string} senderID
 * @param {string} payload
 */
export function handlePostbacks(senderID: string, payload: string) {
  if (payload.startsWith("artwork_favourite::")) {
    callbackForFavouritingArtwork(senderID, payload)
  }
}
