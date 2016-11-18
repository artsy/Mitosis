// @flow

import { handleSettingsCallbacks, SettingsShowKey, SettingsLogoutKey, SettingsLoginKey } from "./contexts/settings"
import { handleSerendipityCallbacks, SerendipityTrendingArtists, SerendipityNewArticles } from "./contexts/serendipity"
import { handleShowsCallbacks, ShowsNearMeKey, ShowsInferCity } from "./contexts/shows"
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
  console.log(`Recieved message: ${message}`)

  // Mobile users will have a capital first letter.
  const userMessage = message.toLowerCase().trim()

  if (userMessage === "help") {
    fbapi.sendTextMessage(context.fbSenderID, "Try saying, 'trending artists' or 'new articles' then dig around.")
    return true
  }

  if (userMessage === "settings") {
    handleSettingsCallbacks(context, SettingsShowKey)
    return true
  }

  if (userMessage === "log in" || userMessage === "login") {
    handleSettingsCallbacks(context, SettingsLoginKey)
    return true
  }

  if (userMessage === "log out" || userMessage === "logout") {
    handleSettingsCallbacks(context, SettingsLogoutKey)
    return true
  }

  if (userMessage === "trending artists") {
    handleSerendipityCallbacks(context, SerendipityTrendingArtists)
    return true
  }

  if (userMessage === "new articles") {
    handleSerendipityCallbacks(context, SerendipityNewArticles)
    return true
  }

  if (userMessage === "shows" || userMessage === "shows neaby") {
    handleShowsCallbacks(context, ShowsNearMeKey)
    return true
  }

  if (userMessage.startsWith("shows in")) {
    handleShowsCallbacks(context, `${ShowsInferCity}::${userMessage}`)
    return true
  }

  return false
}
