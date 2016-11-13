// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery } from "../artsy-api"
import { elementForArticle } from "./article/element"
import { trendingArtistsQuery, newArticlesQuery } from "./serendipity/queries"
import { ArtistOverviewKey } from "./artist"
// Keys for callback resolution

export const SerendipityTrendingArtists = "serendipity-trending-artists"
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
  if (payload.startsWith(SerendipityNewArticles)) { callbackNewArticles(context, payload) }
}

// Shows trending artist
async function callbackTrendingArtists(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(trendingArtistsQuery(), context)
  const artists = results.data.trending_artists.artists
  await fbapi.quickReply(context.fbSenderID, "Trending Artists on Artsy", artists.map((a) => {
    return { content_type: "text", title: a.name, payload: `${ArtistOverviewKey}::${a.id}::${a.name}` }
  }))
}

// Shows new articles
async function callbackNewArticles(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(newArticlesQuery(), context)
  const articles = results.data.articles
  await fbapi.elementCarousel(context.fbSenderID, articles.map(a => elementForArticle(a)))
}
