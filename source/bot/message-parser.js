// @flow

// import { handleArtworkCallbacks } from "./contexts/artwork"
import { handleSettingsCallbacks, SettingsShowKey } from "./contexts/settings"
import { handleSerendipityCallbacks, SerendipityTrendingArtists, SerendipityNewArticles } from "./contexts/serendipity"
import { fbapi } from "../facebook/api"

import type { MitosisUser } from "./types"

/**
 * Handles new messages, giving us the ability to do some rudimentary responses, returns true
 * if it could respond to the message.
 *
 * @param {string} senderID
 * @param {string} payload
 */
export function handleUnknownMessage(context: MitosisUser, message: string, payload: string): boolean {
  // handleArtistCallbacks(context, payload)
  // handleArtworkCallbacks(context, payload)
  console.log(`Recieved message: ${message}`)

  if (message === "help") {
    fbapi.sendTextMessage(context.fbSenderID, "Try saying, 'trending artists' or 'new articles' then dig around.")
    return true
  }

  if (message === "settings") {
    handleSettingsCallbacks(context, SettingsShowKey)
    return true
  }

  if (message === "trending artists") {
    handleSerendipityCallbacks(context, SerendipityTrendingArtists)
    return true
  }

  if (message === "new articles") {
    handleSerendipityCallbacks(context, SerendipityNewArticles)
    return true
  }

  return false
}
