// @flow

import { ArtistFavouriteKey } from "../artist"
import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForArtist(artist: any): GenericElement {
  const url = WEB_URL + artist.href
  return {
    title: artist.name,
    subtitle: artist.blurb,
    item_url: url,
    image_url: artist.images[0].url,
    buttons: [{
      type: "web_url",
      url: url,
      title: "Open on Artsy"
    }, {
      type: "postback",
      title: "Follow",
      payload: `${ArtistFavouriteKey}::${artist.id}::${artist.title}`
    }]
  }
}
