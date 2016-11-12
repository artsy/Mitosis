// @flow

import { callbackForFavouritingArtwork } from "./contexts/artworks"
import type { MitosisUser } from "./types"

/**
 * Handles passing postbacks around the system
 *
 * @param {string} senderID
 * @param {string} payload
 */
export function handlePostbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith("artwork_favourite::")) {
    callbackForFavouritingArtwork(context, payload)
  }
}
