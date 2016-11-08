// @flow

import { api } from "../facebook/api"
import { sendTextMessage } from "./webhook"
function previewForArtwork(artwork: any) {
  const url = `https://artsy.net${artwork.href}`
  return {
    title: artwork.title,
    subtitle: artwork.description,
    item_url: url,
    image_url: "https://d32dm0rphc51dk.cloudfront.net/jPpFqKJywfT_g5f81BB-JQ/normalized.jpg",
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

export function callbackForFavouritingArtwork(senderID: string, payload: string): bool {
  const isMyCallback = payload.startsWith("artwork_favourite::")
  if (isMyCallback) {
    const name = payload.split("::").pop()
    sendTextMessage(senderID, `Saved, ${name} to your Favourites`)
  }
  return isMyCallback
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

  api({
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [previewForArtwork(artwork)]
        }
      }
    }
  })
}
