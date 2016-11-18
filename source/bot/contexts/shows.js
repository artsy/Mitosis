// @flow

import { fbapi } from "../../facebook/api"
import type { MitosisUser } from "../types"
import { Cities } from "places"

interface City {
   slug: string,
   name: string,
   coords: number[],
   sort_order: number,
   timezone: number
}

// Keys for callback resolution

export const ShowsNearMeKey = "shows-near-me"
export const ShowsForCityKey = "shows-for-city"
export const ShowsShowKey = "shows-show"

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
}

// Shows trending artists
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
    return { content_type: "text", title: city.name, payload: `${ShowsForCityKey}::${city.slug}` }
  }))
}

// Get shows for a city
async function callbackShowsForCity(context: MitosisUser, payload: string) {
  const [, showCity] = payload.split("::")

  fbapi.sendTextMessage(context.fbSenderID, `Works for ${showCity}`)
}

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
  const sortedCities = citiesInTimezone.sort((a, b) => a.sort_order > b.sort_order)
  return cities.concat(sortedCities)
}
