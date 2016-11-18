// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery, gravity, GravityTrendingArtistsAPI, GravityEmergingArtistsAPI } from "../artsy-api"
import { elementForArticle } from "./article/element"
import { elementForGravityArtist } from "./artist/element"
import { newArticlesQuery } from "./article/queries"

// Keys for callback resolution

export const SerendipityTrendingArtists = "serendipity-trending-artists"
export const SerendipityEmergingArtists = "serendipity-emerging-artists"
export const SerendipityNewArticles = "serendipity-new-articles"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */

export function handleSerendipityCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(SerendipityTrendingArtists)) { callbackTrendingArtists(context, payload) }
  if (payload.startsWith(SerendipityEmergingArtists)) { callbackEmergingArtists(context, payload) }
  if (payload.startsWith(SerendipityNewArticles)) { callbackNewArticles(context, payload) }
}

// Shows trending artists
async function callbackTrendingArtists(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const artists = await gravity(GravityTrendingArtistsAPI, context)
  fbapi.elementCarousel(context.fbSenderID, "Trending Artists", artists.map((a) => elementForGravityArtist(a)), [])
}

// Shows emerging artists
async function callbackEmergingArtists(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const artists = await gravity(GravityEmergingArtistsAPI, context)
  fbapi.elementCarousel(context.fbSenderID, "Trending Artists", artists.map((a) => elementForGravityArtist(a)), [])
}

// Shows new articles
async function callbackNewArticles(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(newArticlesQuery(), context)
  const articles = results.data.articles
  await fbapi.elementCarousel(context.fbSenderID, "New Articles on Artsy", articles.map(a => elementForArticle(a)), [])
}
