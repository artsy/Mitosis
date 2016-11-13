// @flow

export const artworkQuery = (artworkID: string) => `
{
  artwork(id: "${artworkID}"){
    id
    title
    description
    href
    images {
      url
    }
    artists {
      id
      name
      blurb
    }
    articles(size:1) {
      id
    }
    related(size:1) {
      id
    }
  }
}
`

export const artworkRelatedArticlesQuery = (artworkID: string) => `
{
  artwork(id: "${artworkID}"){
    id
    title
    href
    articles(size:5) {
      title,
      href
      thumbnail_image {
        url
      }
    }
  }
}
`

export const artworkRelatedArtworksQuery = (artworkID: string) => `
{
  artwork(id: "${artworkID}"){
    id
    title
    href
    related(size:5) {
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
