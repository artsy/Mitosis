// @flow
import { elementArtworkEssentialsGraphQL } from "../artwork/element"

export const showInfoQuery = (showID: string, artworkPage: string) => {
  return `
{
  show(id: "${showID}") {
    name
    location {
      id
      display
      address,
      postal_code
    }

    artworks(size: 5, page: ${artworkPage}) {
      ${elementArtworkEssentialsGraphQL}
    }
    description
    press_release(format: PLAIN)
    exhibition_period
  }
}
`
}

