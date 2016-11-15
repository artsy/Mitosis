// @flow

import { elementArtistEssentialsGraphQL } from "./element"
import { elementArticleEssentialsGraphQL } from "../article/element"

export const artistArtworksQuery = (artistID: string, page: number) => `
{
  artist(id:"${artistID}") {
    id
    name
    artworks(size: 5, sort: iconicity_desc, published: true, page:${page}) {
      id
      title
      description
      href
      images {
        url
      }
    }
  }
}
`

export const artistQuery = (artistID: string) => `
{
  artist(id:"${artistID}") {
    ${elementArtistEssentialsGraphQL}
    bio
    blurb
    formatted_nationality_and_birthday
    formatted_artworks_count
    shows(active: true) {
      id
      is_displayable
      is_active
      name
    }
    artworks(size: 5, sort: iconicity_desc, published: true) {
      id
      title
      description
      href
      images {
        url
      }
    }
    articles(limit: 1) {
      ${elementArticleEssentialsGraphQL}
    }
    artists {
      name
    }
  }
}
`

export const artistArticlesQuery = (artistID: string) => `
{
  artist(id:"${artistID}") {
    id
    name
    articles(limit: 10) {
      ${elementArticleEssentialsGraphQL}
    }
  }
}
`
