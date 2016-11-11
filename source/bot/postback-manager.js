// @flow

import { callbackForFavouritingArtwork } from "./contexts/artworks"
import type { MessageContext } from "./types"

/**
 * Handles passing postbacks around the system
 *
 * @param {string} senderID
 * @param {string} payload
 */
export function handlePostbacks(context: MessageContext, payload: string) {
  if (payload.startsWith("artwork_favourite::")) {
    callbackForFavouritingArtwork(context, payload)
  }
}
