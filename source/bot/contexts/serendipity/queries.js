// @flow

export const trendingArtistsQuery = () => {
  const sorts = ["ARTIST_FOLLOW", "ARTIST_INQUIRY", "ARTIST_SEARCH", "ARTIST_SAVE", "ARTIST_FAIR", "ARTIST_AUCTION_LOT"]
  const randomIndex = Math.floor(Math.random() * sorts.length)
  return `
  {
    trending_artists(name:${sorts[randomIndex]}) {
      artists {
        name 
        id
      }
    }
  }
  `
}

export const newArticlesQuery = () => `
{
  articles(sort: PUBLISHED_AT_ASC, published:true) {
    title
    thumbnail_image {
      url
    }
  }
}
`
