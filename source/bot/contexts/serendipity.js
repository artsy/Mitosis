// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery, gravity, GravityTrendingArtistsAPI, GravityEmergingArtistsAPI } from "../artsy-api"
import { elementForArticle } from "./article/element"
import { elementForArtist } from "./artist/element"
import { trendingArtistsQuery } from "./serendipity/queries"
import { newArticlesQuery } from "./article/queries"
import { ArtistOverviewKey } from "./artist"

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
  const results = await gravity(GravityTrendingArtistsAPI, context)
  const artists = results
  if (artists.length) {
    fbapi.elementCarousel(context.fbSenderID, "Trending Artists", artists.map((a) => elementForArtist(a)), [])
  } else {
    fbapi.quickReply(context.fbSenderID, "No Artists found, here's some of the bot author's favourites:", [
      { content_type: "text", title: "Adam Miller", payload: `${ArtistOverviewKey}::adam-miller::Adam Miller` },
      { content_type: "text", title: "Michael Kenner", payload: `${ArtistOverviewKey}::michael-kenner::Michael Kenner` },
      { content_type: "text", title: "Daniel Ludwig", payload: `${ArtistOverviewKey}::daniel-ludwig::Daniel Ludwig` },
      { content_type: "text", title: "Sol Lewitt", payload: `${ArtistOverviewKey}::sol-letwitt::Sol Lewitt` }
    ])
  }
}

// Shows emerging artists
async function callbackEmergingArtists(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(trendingArtistsQuery(), context)
  const artists = results.data.trending_artists.artists
  if (artists.length) {
    fbapi.elementCarousel(context.fbSenderID, "Trending Artists", artists.map((a) => elementForArtist(a)), [])
  } else {
    fbapi.quickReply(context.fbSenderID, "No Artists found, here's some of the bot author's favourites:", [
      { content_type: "text", title: "Adam Miller", payload: `${ArtistOverviewKey}::adam-miller::Adam Miller` },
      { content_type: "text", title: "Michael Kenner", payload: `${ArtistOverviewKey}::michael-kenner::Michael Kenner` },
      { content_type: "text", title: "Daniel Ludwig", payload: `${ArtistOverviewKey}::daniel-ludwig::Daniel Ludwig` },
      { content_type: "text", title: "Sol Lewitt", payload: `${ArtistOverviewKey}::sol-letwitt::Sol Lewitt` }
    ])
  }
}

// Shows new articles
async function callbackNewArticles(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(newArticlesQuery(), context)
  const articles = results.data.articles
  await fbapi.elementCarousel(context.fbSenderID, "New Articles on Artsy", articles.map(a => elementForArticle(a)), [])
}
