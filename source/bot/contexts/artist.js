// @flow

import { fbapi } from "../../facebook/api"
import { metaphysicsQuery } from "../artsy-api"
import { elementForArtwork } from "./artwork/element"
import type { MitosisUser } from "../types"
import { artistArtworksQuery, artistQuery } from "./artist/queries"
import { elementForArtist } from "./artist/element"

// Keys for callback resolution

export const ArtistShowArtworksKey = "artist-show-artworks"
export const ArtistOverviewKey = "artist-overview"
export const ArtistShowKey = "artist-show"
export const ArtistFavouriteKey = "artist-favourite"
export const ArtistArticlesKey = "artist-articles"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */
export function handleArtistCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(ArtistOverviewKey)) { callbackForArtistOverview(context, payload) }
  if (payload.startsWith(ArtistShowArtworksKey)) { callbackForArtistArtworks(context, payload) }
  if (payload.startsWith(ArtistShowKey)) { callbackForShowingArtist(context, payload) }
  if (payload.startsWith(ArtistFavouriteKey)) { callbackForSavingArtist(context, payload) }
}

// General overview, show a few artworks too
async function callbackForArtistOverview(context: MitosisUser, payload: string) {
  const [, artistID, artistName] = payload.split("::")
  const artistIDAndName = artistID + "::" + artistName

  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(artistQuery(artistID), context)

  const hasArticles = results.artist.articles.length > 0

  await fbapi.elementCarousel(context.fbSenderID, results.results.artist.artworks.map(a => elementForArtwork(a)))
  await fbapi.quickReply(context.fbSenderID, `About ${artistName}`, [
    { content_type: "text", title: "Favourite", payload: `${ArtistFavouriteKey}::${artistIDAndName}` },
    { content_type: "text", title: `About ${artistName}`, payload: `${ArtistShowKey}::${artistIDAndName}` },
    { content_type: "text", title: "More Artworks", payload: `${ArtistShowArtworksKey}::${artistIDAndName}::2` },
    hasArticles ? { content_type: "text", title: "Related Articles", payload: `${ArtistArticlesKey}::${artistIDAndName}` } : null
  ])
  await fbapi.stopTyping(context.fbSenderID)
}

// Deeper overview, more focused on the artist metadata specifically
async function callbackForShowingArtist(context: MitosisUser, payload: string) {
  const [, artistID, artistName] = payload.split("::")
  const artistIDAndName = artistID + "::" + artistName

  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(artistQuery(artistID), context)

  await fbapi.elementCarousel(context.fbSenderID, [elementForArtist(results.results.artist)])
  await fbapi.quickReply(context.fbSenderID, `About ${artistName}`, [
    { content_type: "text", title: "Favourite", payload: `${ArtistFavouriteKey}::${artistIDAndName}` },
    { content_type: "text", title: "More Artworks", payload: `${ArtistShowArtworksKey}::${artistIDAndName}::2` }
  ])
  await fbapi.stopTyping(context.fbSenderID)
}

// Show a few Artworks in a carousel
async function callbackForArtistArtworks(context: MitosisUser, payload: string) {
  const [, artistID, artistName, pageNumberString] = payload.split("::")
  const artistIDAndName = artistID + "::" + artistName
  const pageNumber = parseInt(pageNumberString)

  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(artistArtworksQuery(artistID, pageNumber), context)

  await fbapi.elementCarousel(context.fbSenderID, results.results.artist.artworks.map(a => elementForArtwork(a)))
  await fbapi.quickReply(context.fbSenderID, `More works from ${results.data.artist.name}`, [
    { content_type: "text", title: "More Artworks", payload: `${ArtistShowArtworksKey}::${artistIDAndName}::${pageNumber + 1}` },
    { content_type: "text", title: `About ${artistName}`, payload: `${ArtistOverviewKey}::${artistIDAndName}` }
  ])
}

// Saves an artwork to your user account, will need to handle forcing you to log in too
async function callbackForSavingArtist(context: MitosisUser, payload: string) {
  // const [, artistID] = payload.split("::")
  // await gravityPost({ artist_id: artistID }, "/api/v1/me/follow/artist", context)
  fbapi.sendTextMessage(context.fbSenderID, "Sorry - Artsy login isn't working yet")
}
