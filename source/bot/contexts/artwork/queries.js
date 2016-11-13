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
    }
    related(size:1) {
      id
    }
  }
}
`

export const artworkRelatedQuery = (artworkID: string) => `
{
  artwork(id: "${artworkID}"){
    id
    title
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
