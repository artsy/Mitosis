// @flow

 import { elementArticleEssentialsGraphQL } from "./element"

 export const newArticlesQuery = () => `
{
  articles(sort: PUBLISHED_AT_DESC, published:true) {
    ${elementArticleEssentialsGraphQL}
    published_at
  }
}
`
