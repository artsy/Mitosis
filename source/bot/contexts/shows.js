// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { Cities } from "places"
import { updateMitosisUser } from "../../db/mongo"
import { GravityShowsSearchAPI, gravity, metaphysicsQuery } from "../artsy-api"
import { elementForArtwork } from "./artwork/element"
import { elementForGravityShow } from "./shows/element"
import { showInfoQuery } from "./shows/queries"
const querystring = require("querystring")

interface City {
   slug: string,
   name: string,
   coords: number[],
   sort_order: number,
   timezone: number
}

// Keys for callback resolution

export const ShowsNearMeKey = "shows-near-me"
export const ShowsSaveAsMyCity = "shows-save-for-my-city"
export const ShowsSetMyCity = "shows-set-for-my-city"
export const ShowsForCityKey = "shows-for-city"
export const ShowsShowKey = "shows-show"
export const ShowsShowInfo = "shows-info-show"
export const ShowsShowPressRelease = "shows-press-release-show"
export const ShowsShowArtworks = "shows-artworks-show"
export const ShowsFavPartner = "shows-favourite-partner"
export const ShowsInferCity = "shows-infer-city"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */

export function handleShowsCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(ShowsNearMeKey)) { callbackShowsNearMe(context, payload) }
  if (payload.startsWith(ShowsForCityKey)) { callbackShowsForCity(context, payload) }
  if (payload.startsWith(ShowsSaveAsMyCity)) { callbackForShowsSaveAsMyCity(context, payload) }
  if (payload.startsWith(ShowsSetMyCity)) { callbackForSetSaveAsMyCity(context, payload) }
  if (payload.startsWith(ShowsShowInfo)) { callbackForShowsInfo(context, payload) }
  if (payload.startsWith(ShowsShowPressRelease)) { callbackForShowsPressRelease(context, payload) }
  if (payload.startsWith(ShowsInferCity)) { callbackForShowsInferCity(context, payload) }
}

// Shows a list of shows nearby, or just jumps straight into shows nearby
async function callbackShowsNearMe(context: MitosisUser, payload: string) {
  fbapi.startTyping(context.fbSenderID)
  const cities = citiesForUser(context)
  if (cities.length === 1) {
    // If there's only going be one result, skip showing an option
    callbackShowsForCity(context, `${ShowsForCityKey}::${cities.pop().slug}`)
    return
  }
  // Present a list to choose from
  await fbapi.quickReply(context.fbSenderID, "Which is the closest city to you?", cities.map((city) => {
    return { content_type: "text", title: city.name, payload: `${ShowsSaveAsMyCity}::${city.slug}::${city.name}` }
  }))
}

// Highlight shows for a city
async function callbackShowsForCity(context: MitosisUser, payload: string) {
  const [, showCityID] = payload.split("::")
  const city = Cities.find((c) => c.slug === showCityID)
  const query = querystring.stringify({
    near: city.coords.toString(),
    sort: "-start_at",
    size: 5,
    displayable: true,
    at_a_fair: false
  })

  const url = `${GravityShowsSearchAPI}?${query}`
  const shows = await gravity(url, context)
  await fbapi.elementCarousel(context.fbSenderID, `Shows near ${city.name}`, shows.map(show => elementForGravityShow(show)), [])
}

// A show overview, showing artworks, and supports paginating through the works
async function callbackForShowsInfo(context: MitosisUser, payload: string) {
  const [, showID, showName, artworksPage] = payload.split("::")
  const page = artworksPage || "1"
  const query = showInfoQuery(showID, page)
  const results = await metaphysicsQuery(query, context)
  const show = results.data.show
  const firstPage = page === "1"
  if (firstPage) {
    let location = show.location.display
    if (location === null) {
      location = `${show.location.address}, ${show.location.postal_code}`
    }
    await fbapi.sendTextMessage(context.fbSenderID, `${show.exhibition_period}
${location}

${show.description}
    `)
  }
  if (show.artworks.length) {
    const showPressRelease = firstPage && show.press_release !== null && show.press_release.length > 0
    await fbapi.elementCarousel(context.fbSenderID, `Works at ${showName}`, show.artworks.map(a => elementForArtwork(a)), [
      { content_type: "text", title: "More Artworks", payload: `${ShowsShowInfo}::${showID}::${showName}::${parseInt(page) + 1}` },
      showPressRelease ? { content_type: "text", title: "Press Release", payload: `${ShowsShowPressRelease}::${showID}::${showName}` } : null
    ])
  } else {
    await fbapi.sendTextMessage(context.fbSenderID, "That's all of the artworks for the show.")
  }
}

// Show just the press release, they are long so don't do it on info
async function callbackForShowsPressRelease(context: MitosisUser, payload: string) {
  const [, showID] = payload.split("::")
  const query = showInfoQuery(showID, "1")
  const results = await metaphysicsQuery(query, context)
  const show = results.data.show
  await fbapi.sendLongMessage(context.fbSenderID, show.press_release)
}

// If you have choosen a city, let it be the default
async function callbackForShowsSaveAsMyCity(context: MitosisUser, payload: string) {
  const [, showCityID, cityName] = payload.split("::")

  await fbapi.quickReply(context.fbSenderID, `Would you like to save ${cityName} as your local city?`, [
    { content_type: "text", title: "Yes please", payload: `${ShowsSetMyCity}::${showCityID}::${cityName}` },
    { content_type: "text", title: "No thanks", payload: `${ShowsForCityKey}::${showCityID}::${cityName}` }
  ])
}

// Try and figure out what city the user is after
async function callbackForShowsInferCity(context: MitosisUser, payload: string) {
  let [, message] = payload.split("::")
  message = message.replace("nyc", "new york")
                   .replace("new york city", "new york")
                   .replace("SF", "san francisco")
                   .replace("cupertino", "san francisco")
  const cityID = message.replace("shows in", "").trim().replace(" ", "-").replace(".", "").replace("?", "")
  const city = Cities.find((c) => c.slug === cityID)
  if (city) {
    callbackShowsForCity(context, `${ShowsForCityKey}::${city.slug}::${city.name}`)
  } else {
    const sortedCities = Cities.sort((a, b) => a.sort_order < b.sort_order).reverse()
    fbapi.sendLongMessage(context.fbSenderID, `Sorry, we could not find your city. Here is our list of cities to work from: 
    
${sortedCities.map((c) => { return c.name }).join(", ")}`)
  }
}

// Save your location if you wanted to, thne show the city
async function callbackForSetSaveAsMyCity(context: MitosisUser, payload: string) {
  const [, showCityID, cityName] = payload.split("::")
  context.artsyLocationCitySlug = showCityID
  fbapi.startTyping(context.fbSenderID)
  await updateMitosisUser(context)
  fbapi.sendTextMessage(context.fbSenderID, `Set ${cityName} as your local city. You can say "shows" at any time to see shows in ${cityName}`)
  callbackShowsForCity(context, `${ShowsForCityKey}::${showCityID}::${cityName}`)
}

// Try and figure out the useful cities for a user
function citiesForUser(context: MitosisUser): City[] {
  // Are we certain?
  if (context.artsyLocationCitySlug !== undefined) {
    const locaton = Cities.find((c) => c.slug === context.artsyLocationCitySlug)
    return [locaton]
  }

  // If not be pretty good about showing the first
  const cities = []
  if (context.favouriteCitySlug !== undefined) {
    cities.push(Cities.find((c) => c.slug === context.favouriteCitySlug))
  }

  // And then the rest in the timezone
  const citiesInTimezone = Cities.filter((c) => Math.round(c.timezone) === Math.round(context.timezoneOffset))
  const sortedCities = citiesInTimezone.sort((a, b) => a.sort_order < b.sort_order).reverse()
  return cities.concat(sortedCities)
}
