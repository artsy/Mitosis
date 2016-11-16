// @flow

require("../globals")
require("../db/mongo")

import { elementForArticle } from "../bot/contexts/article/element"
import { newArticlesQuery } from "../bot/contexts/article/queries"
import { showMainMenu } from "../bot/contexts/main-menu"

import { metaphysicsQuery } from "../bot/artsy-api"
import { fbapi } from "../facebook/api"
import { findAllUsersWithGMTHour } from "../db/mongo"

// Get the current hours offset from GMT
// Derive the 3 potential slots for notifications
// Get all users that are subscribed
// Send them a hello message

const roundToNearest = (round: number, numToRoundTo: number) => Math.round(round / numToRoundTo) * numToRoundTo

const date = new Date()
const currentHour = date.getHours()
const gmtOffsetMinutes = date.getTimezoneOffset()

// Not optimal, but it's a start, this lets us do work every hour
const gmtOffsetHours = roundToNearest(gmtOffsetMinutes, 60)
const hourWeCareAbout = currentHour - gmtOffsetHours

console.log(`Handling anyone at GMT ${hourWeCareAbout}`)

const sendUpdates = async (hour: number) => {
  const users = await findAllUsersWithGMTHour(hourWeCareAbout)

  console.log(`Sending notifications to ${users.length} people`)
  if (users.length === 0) { process.exit() }

  const firstUser = users[0]
  const results = await metaphysicsQuery(newArticlesQuery(), firstUser)

  const millisecondsPerDay = 1000 * 60 * 60 * 24
  const cutOffFilter = millisecondsPerDay * 1

  const yesterdaysArticles = results.data.articles.filter((a) => {
    return (Date.now() - Date.parse(a.published_at)) > cutOffFilter
  })

  for (const user of users) {
    const message = `Hey there ${user.firstName}`
    await fbapi.elementCarousel(user.fbSenderID, message, yesterdaysArticles.map(a => elementForArticle(a)), [])
    await showMainMenu(user, "You can also explore Artsy")
  }

  process.exit()
}

sendUpdates(hourWeCareAbout)
