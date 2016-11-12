// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { metaphysicsQuery, gravityPost } from "../artsy-api"

export function elementForArtwork(artwork: any) {
  const url = `https://artsy.net${artwork.href}`
  return {
    title: artwork.title,
    subtitle: artwork.description,
    item_url: url,
    image_url: artwork.images[0].url,
    buttons: [{
      type: "web_url",
      url: url,
      title: "Open on Artsy"
    }, {
      type: "postback",
      title: "Favourite",
      payload: `artwork_favourite::${artwork.id}::${artwork.title}`
    }]
  }
}

export async function callbackForFavouritingArtwork(context: MitosisUser, payload: string): ?Promise<void> {
  const [, artworkID, artworkName] = payload.split("::")
  // TODO: Save to favs
  // TODO: Get artwork details for Artist
  const artistIDAndName = ""
  // TODO: Get Gene deets for Artwork

  const geneIDAndName = "geneID::Gene Name"

  fbapi.startTyping(context.fbSenderID)
  await gravityPost({ user_id: context.artsyUserID }, `/api/v1/collection/saved-artwork/artwork/${artworkID}`, context)
  await metaphysicsQuery(artworkQuery(artworkID), context)
  await fbapi.quickReply(context.fbSenderID, `Saved, ${artworkName} to your Favourites`, [
    { content_type: "text", title: "Favourite Artist", payload: `favourite-artist::${artistIDAndName}` },
    { content_type: "text", title: `About ${artworkName}`, payload: `show-artist::${artistIDAndName}` },
    { content_type: "text", title: "More from Expressionism", payload: `open-gene::${geneIDAndName}` }
  ])
  await fbapi.stopTyping(context.fbSenderID)
}

export function artsyArtworks(recipientId: string) {
  const artwork = {
    id: "ryohei-usui-ennui",
    title: "Ennui",
    href: "/artwork/ryohei-usui-ennui",
    description: "Ed Ruscha defies categorization with his diverse output of photographic books and tongue-in-cheek photo-collages, paintings, and drawings. Insects as a subject evoke both Dadaist and Surrealistic tendencies, and the physical environment of the artist's studio. Why insects? \"Because I have a jillion cockroaches around my studio. I love them, but I don’t want them around.\"",
    images: [
      {
        id: "5820f5ef9a3cdd58ca00060e",
        url: "https://d32dm0rphc51dk.cloudfront.net/jPpFqKJywfT_g5f81BB-JQ/normalized.jpg"
      }
    ]
  }

  fbapi.elementCarousel(recipientId, [elementForArtwork(artwork)])
}

const artworkQuery = (artworkID: string) => `
{
  artwork(id: "${artworkID}"){
    id
    title
    description
    href
    images {
      url
    }
    artists {
      id
      name
    }
  }
}
`
