// @flow

import { fbapi } from "../../facebook/api"
import { metaphysicsQuery, gravityPost } from "../artsy-api"
import { elementForArtwork } from "./artworks"
import type { MessageContext } from "../types"

export function elementForArtist(artist: any) {
  const url = `https://artsy.net${artist.href}`
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
      payload: `artist_follow::${artist.id}::${artist.title}`
    }]
  }
}

export async function callbackForShowingArtist(context: MessageContext, payload: string) {
  const apiToken = "asdasd"
  const name = payload.split("::").pop()
  const artistID = "OK"

  // TOOD: Get API token DI'd in
  // TODO: Get Gene deets for Artist
  // TODO: Get Show deets?
  // TODO: Get a few artworks

  const artistIDAndName = "artistID::Artist Name"
  const geneIDAndName = "geneID::Gene Name"

  fbapi.startTyping(context.fbSenderID)
  await gravityPost({ }, `/api/v1/collection/saved-artwork/artwork/${artistID}`, apiToken)

  await metaphysicsQuery("{}", apiToken)
  await fbapi.quickReply(context.fbSenderID, "", [
    { content_type: "text", title: "Favourite", payload: `favourite-artist::${artistIDAndName}` },
    { content_type: "text", title: `About ${name}`, payload: `show-artist::${artistIDAndName}` },
    { content_type: "text", title: "About Expressionism", payload: `open-gene::${geneIDAndName}` }
  ])
  await fbapi.elementCarousel(context.fbSenderID, [
    elementForArtwork({ id: "ok", title: "ok", href: "/artwork/OK", images: [{id: "", url: ""}] })
  ])
  await fbapi.stopTyping(context.fbSenderID)
}
