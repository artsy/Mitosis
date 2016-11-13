// @flow
import { elementArtistEssentialsGraphQL } from "../artist/element"

export const trendingArtistsQuery = () => {
  const sorts = ["ARTIST_FOLLOW", "ARTIST_INQUIRY", "ARTIST_SEARCH", "ARTIST_SAVE", "ARTIST_FAIR", "ARTIST_AUCTION_LOT"]
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

export const newArticlesQuery = () => `
{
  articles(sort: PUBLISHED_AT_DESC, published:true) {
    title
    thumbnail_title
    href
    thumbnail_image {
      url
    }
  }
}
`
