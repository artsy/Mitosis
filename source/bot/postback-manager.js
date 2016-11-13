// @flow

import { handleArtworkCallbacks } from "./contexts/artwork"
import { handleArtistCallbacks } from "./contexts/artist"

import type { MitosisUser } from "./types"

/**
 * Handles passing postbacks around the system
 *
 * @param {string} senderID
 * @param {string} payload
 */
export function handlePostbacks(context: MitosisUser, payload: string) {
  handleArtistCallbacks(context, payload)
  handleArtworkCallbacks(context, payload)
}
