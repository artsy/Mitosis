// @flow

export const artistArtworksQuery = (artistID: string, page: number) => `
{
  artist(id:"${artistID}") {
    id
    name
    artworks(size: 5, sort: iconicity_desc, published: true, page:${page}) {
      id
      title
      description
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
    id
    blurb
    image {
      url(version: "square")
    }
    shows(active: true) {
      id
      is_displayable
      is_active
    }
    artworks(size: 5, sort: iconicity_desc, published: true) {
      id
      title
      description
      images {
        url
      }
    }
    articles{
      title,
      href
      thumbnail_image {
        url
      }
    }
    artists {
      name
    }
  }
}
`
