// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery, gravityPost } from "../artsy-api"
import { elementForArtwork } from "./artwork/element"
import { artworkQuery } from "./artwork/queries"
import { ArtistOverviewKey, ArtistFavouriteKey } from "./artist"
// Keys for callback resolution

export const ArtworkFavouriteKey = "artwork-favourite"
export const ArtworkOverviewKey = "artwork-overview"

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
}

// Saving an Artwork
async function callbackForFavouritingArtwork(context: MitosisUser, payload: string) {
  const [, artworkID, artworkName] = payload.split("::")

  // Save it
  fbapi.startTyping(context.fbSenderID)
  await gravityPost({ user_id: context.artsyUserID }, `/api/v1/collection/saved-artwork/artwork/${artworkID}`, context)

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

// General overview of an Artwork
async function callbackForArtworkOverview(context: MitosisUser, payload: string): ?Promise<void> {
  const [, artworkID] = payload.split("::")

  const result = await metaphysicsQuery(artworkQuery(artworkID), context)
  const artist = result.data.artist[0]
  const artistIDAndName = `${artist.id}::${artist.name}`

  await fbapi.elementCarousel(context.fbSenderID, [elementForArtwork(result.data.artwork)])
  await fbapi.sendTextMessage(context.fbSenderID, result.data.artwork.description)

  await fbapi.quickReply(context.fbSenderID, "", [
    { content_type: "text", title: "Favourite Artist", payload: `${ArtistFavouriteKey}::${artistIDAndName}` }
    // { content_type: "text", title: `About ${artworkName}`, payload: `${A}::${artistIDAndName}` }
    // { content_type: "text", title: "More from Expressionism", payload: `gene-show::${geneIDAndName}` }
  ])
}
