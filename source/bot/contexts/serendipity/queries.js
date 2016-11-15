// @flow
import { elementArtistEssentialsGraphQL } from "../artist/element"

export const trendingArtistsQuery = () => {
  const sorts = ["ARTIST_SEARCH", "ARTIST_SAVE", "ARTIST_FAIR"]
  const randomIndex = Math.floor(Math.random() * sorts.length)
  return `
  {
    trending_artists(name:${sorts[randomIndex]}) {
      artists {
        ${elementArtistEssentialsGraphQL}
      }
    }
  }
  `
}

