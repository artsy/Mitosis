// @flow

import { ArtworkFavouriteKey, ArtworkOverviewKey } from "../artwork"
import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForArtwork(artwork: any): GenericElement {
  const url = WEB_URL + artwork.href
  return {
    title: artwork.title || "Untitled",
    subtitle: artwork.description,
    item_url: url,
    image_url: artwork.images[0].url,
    buttons: [{
      type: "postback",
      title: "Favourite",
      payload: `${ArtworkFavouriteKey}::${artwork.id}::${artwork.title}`
    }, {
      type: "postback",
      title: "More info",
      payload: `${ArtworkOverviewKey}::${artwork.id}::${artwork.title}`
    }]
  }
}
