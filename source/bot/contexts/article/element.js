// @flow

import type { GenericElement } from "../../../facebook/types"
import { WEB_URL } from "../../../globals"

export function elementForArticle(article: any): GenericElement {
  const url = WEB_URL + article.href
  return {
    title: article.thumbnail_title,
    item_url: url,
    image_url: article.thumbnail_image.url,
    buttons: [{
      type: "web_url",
      url: url,
      title: "Open on Artsy"
    }]
  }
}

export const elementArticleEssentialsGraphQL = `
href
thumbnail_title
href
thumbnail_image {
  url
}
`
