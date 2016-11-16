// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery } from "../artsy-api"
import { elementForArtwork } from "./artwork/element"
import { elementForArticle } from "./article/element"
import { artworkQuery, artworkRelatedArticlesQuery, artworkRelatedArtworksQuery } from "./artwork/queries"
import { ArtistOverviewKey, ArtistFavouriteKey } from "./artist"
import { SerendipityNewArticles } from "./serendipity"

// Keys for callback resolution

export const ArtworkFavouriteKey = "artwork-favourite"
export const ArtworkOverviewKey = "artwork-overview"
export const ArtworkShowKey = "artwork-show"
export const ArtworkRelatedArtworksKey = "artwork-related-artworks"
export const ArtworkRelatedArticlesKey = "artwork-related-articles"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */

export function handleArtworkCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(ArtworkFavouriteKey)) { callbackForFavouritingArtwork(context, payload) }
  if (payload.startsWith(ArtworkOverviewKey)) { callbackForArtworkOverview(context, payload) }
  if (payload.startsWith(ArtworkRelatedArtworksKey)) { callbackForArtworkRelatedArtworks(context, payload) }
  if (payload.startsWith(ArtworkRelatedArticlesKey)) { callbackForArtworkRelatedArticles(context, payload) }
}

// Saving an Artwork
async function callbackForFavouritingArtwork(context: MitosisUser, payload: string) {
  const [, artworkID, artworkName] = payload.split("::")

  // Save it
  fbapi.startTyping(context.fbSenderID)
  // await gravityPost({ user_id: context.artsyUserID }, `/api/v1/collection/saved-artwork/artwork/${artworkID}`, context)
  await fbapi.sendTextMessage(context.fbSenderID, "Sorry - Artsy login isn't working yet")

  // Offer some jump-off places
  const result = await metaphysicsQuery(artworkQuery(artworkID), context)
  const artist = result.data.artist[0]
  const artistIDAndName = `${artist.id}::${artist.name}`

  await fbapi.quickReply(context.fbSenderID, `Saved, ${artworkName} to your Favourites`, [
    { content_type: "text", title: "Favourite Artist", payload: `${ArtistFavouriteKey}::${artistIDAndName}` },
    { content_type: "text", title: `About ${artist.name}`, payload: `${ArtistOverviewKey}::${artistIDAndName}` }
    // { content_type: "text", title: "More from Expressionism", payload: `gene-show::${geneIDAndName}` }
  ])
  await fbapi.stopTyping(context.fbSenderID)
}

// General overview of an Artwork, e.g. description etc
async function callbackForArtworkOverview(context: MitosisUser, payload: string): ?Promise<void> {
  const [, artworkID] = payload.split("::")

  const result = await metaphysicsQuery(artworkQuery(artworkID), context)
  const artwork = result.data.artwork
  const artist = artwork.artists[0]
  const artworkIDAndName = `${artwork.id}::${artwork.title}`
  const artistIDAndName = `${artist.id}::${artist.name}`
  const hasRelatedArtworks = artwork.related.length > 0
  const hasRelatedArticles = artwork.related.length > 0

  // Show the Artist image + link
  await fbapi.elementCarousel(context.fbSenderID, `About Artwork ${artwork.title}`, [elementForArtwork(artwork)], [])

  // Try show some useful info about the work, or the artist
  let message = "Find out more about this work"
  if (artwork.description !== null) {
    message = artwork.description
  } else if (artist.blurb !== null) {
    message = "About the Artist:\n\n" + artist.blurb
  }

  // Offer some jump off points
  await fbapi.quickReply(context.fbSenderID, message, [
    { content_type: "text", title: "Add to Favourite", payload: `${ArtistFavouriteKey}::${artistIDAndName}` },
    { content_type: "text", title: `About ${artist.name}`, payload: `${ArtistOverviewKey}::${artistIDAndName}` },
    hasRelatedArtworks ? { content_type: "text", title: "Related Artworks", payload: `${ArtworkRelatedArtworksKey}::${artworkIDAndName}` } : null,
    hasRelatedArticles ? { content_type: "text", title: "Related Articles", payload: `${ArtworkRelatedArticlesKey}::${artworkIDAndName}` } : null
  ])
}

// Shows artworks related to an Artwork
async function callbackForArtworkRelatedArtworks(context: MitosisUser, payload: string): ?Promise<void> {
  const [, artworkID, artworkName] = payload.split("::")

  const result = await metaphysicsQuery(artworkRelatedArtworksQuery(artworkID), context)
  const artworks = result.data.artwork.related

  await fbapi.elementCarousel(context.fbSenderID, `Artworks Related to ${artworkName}`, artworks.map((a) => elementForArtwork(a)), [])
}

// Shows related articles to an artist
async function callbackForArtworkRelatedArticles(context: MitosisUser, payload: string) {
  const [, artworkID, artworkName] = payload.split("::")

  fbapi.startTyping(context.fbSenderID)
  const results = await metaphysicsQuery(artworkRelatedArticlesQuery(artworkID), context)
  await fbapi.elementCarousel(context.fbSenderID, `Articles Related to ${artworkName}`, results.data.artwork.articles.map(a => elementForArticle(a)), [
      { content_type: "text", title: "New Articles", payload: SerendipityNewArticles }
  ])
}
