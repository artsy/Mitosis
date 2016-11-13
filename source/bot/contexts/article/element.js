// @flow

import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForArticle(article: any): GenericElement {
  const url = WEB_URL + article.href
  return {
    title: article.name,
    subtitle: article.thumbnail_teaser,
    item_url: url,
    image_url: article.thumbnail_image.url,
    buttons: [{
      type: "web_url",
      url: url,
      title: "Open on Artsy"
    }]
  }
}
