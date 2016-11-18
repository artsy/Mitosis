// @flow

import { handleArtworkCallbacks } from "./contexts/artwork"
import { handleArtistCallbacks } from "./contexts/artist"
import { handleSerendipityCallbacks } from "./contexts/serendipity"
import { handleSettingsCallbacks } from "./contexts/settings"
import { handleMenuCallbacks } from "./contexts/main-menu"
import { handleShowsCallbacks } from "./contexts/shows"

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
  handleSerendipityCallbacks(context, payload)
  handleSettingsCallbacks(context, payload)
  handleMenuCallbacks(context, payload)
  handleShowsCallbacks(context, payload)
}
