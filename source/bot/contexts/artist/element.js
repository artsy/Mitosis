// @flow

import { ArtistFavouriteKey, ArtistOverviewKey } from "../artist"
import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForMetaphysicsArtist(artist: any): GenericElement {
  const url = WEB_URL + artist.href
  return {
    title: artist.name,
    subtitle: artist.blurb,
    item_url: url,
    image_url: artist.image.url,
    buttons: [{
      type: "postback",
      title: "Show More Info",
      payload: `${ArtistOverviewKey}::${artist.id}::${artist.name}`
    }, {
      type: "postback",
      title: "Follow",
      payload: `${ArtistFavouriteKey}::${artist.id}::${artist.name}`
    }]
  }
}

export const elementArtistEssentialsGraphQL = `
id
name
blurb
href
image {
  url
}
`

export function elementForGravityArtist(artist: any): GenericElement {
  const url = WEB_URL + "/artist/" + artist.id
  return {
    title: artist.name,
    subtitle: artist.nationality,
    item_url: url,
    image_url: artist.image_urls.four_thirds,
    buttons: [{
      type: "postback",
      title: "Show More Info",
      payload: `${ArtistOverviewKey}::${artist.id}::${artist.name}`
    }, {
      type: "postback",
      title: "Follow",
      payload: `${ArtistFavouriteKey}::${artist.id}::${artist.name}`
    }]
  }
}
