// @flow

import { ShowsFavPartner, ShowsShowInfo, ShowsShowArtworks } from "../shows"
import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForGravityShow(show: any): GenericElement {
  const url = WEB_URL + "show/" + show.id
  return {
    title: show.name,
    subtitle: show.partner.name,
    item_url: url,
    image_url: show.image_urls.large_rectangle || show.image_urls.featured || show.image_urls.general,
    buttons: [{
      type: "postback",
      title: `Follow ${show.partner.name}`,
      payload: `${ShowsFavPartner}::${show.id}::${show.name}`
    }, {
      type: "postback",
      title: "More info",
      payload: `${ShowsShowInfo}::${show.id}::${show.name}::1`
    }]
  }
}
