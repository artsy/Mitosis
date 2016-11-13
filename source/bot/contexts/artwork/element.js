// @flow

import { ArtworkFavouriteKey } from "../artwork"
import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForArtwork(artwork: any): GenericElement {
  const url = WEB_URL + artwork.href
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
      payload: `${ArtworkFavouriteKey}::${artwork.id}::${artwork.title}`
    }]
  }
}
