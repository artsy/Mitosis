// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"

export const MainMenuKey = "main-menu-show"

import { SerendipityTrendingArtists, SerendipityNewArticles } from "./serendipity"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */
export function handleMenuCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(MainMenuKey)) { callbackForMainMenu(context, payload) }
}

// General overview, show a few artworks too
async function callbackForMainMenu(context: MitosisUser, payload: string) {
  // Maybe show trending artists once a week?
  callbackForMainMenu(context, "Would you like to look around?")
}

export async function showMainMenu(context: MitosisUser, message: string) {
  await fbapi.quickReply(context.fbSenderID, message, [
    { content_type: "text", title: "New Articles", payload: SerendipityNewArticles },
    { content_type: "text", title: "Trending Artists", payload: SerendipityTrendingArtists }
  ])
}
