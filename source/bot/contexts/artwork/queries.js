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
  }
}
`
