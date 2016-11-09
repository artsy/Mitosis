// @flow

import { fbapi } from "../../facebook/api"

export async function callbackForShowingArtist(senderID: string, payload: string): ?Promise<void> {
  const name = payload.split("::").pop()
  // const artworkIDAndName = payload.split("::").splice(1).join("::")
  // TODO: Save to favs
  // TODO: Get artwork details for Artist
  // TODO: Get Gene deets for Artwork
  const artistIDAndName = "artistID::Artist Name"
  const geneIDAndName = "geneID::Gene Name"

  await fbapi.startTyping(senderID)
  await fbapi.quickReply(senderID, `Saved, ${name} to your Favourites`, [
    { content_type: "text", title: "Favourite Artist", payload: `favourite-artist::${artistIDAndName}` },
    { content_type: "text", title: `About ${name}`, payload: `show-artist::${artistIDAndName}` },
    { content_type: "text", title: "About Expressionism", payload: `open-gene::${geneIDAndName}` }
  ])
  await fbapi.stopTyping(senderID)
}
