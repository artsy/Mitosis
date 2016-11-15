// @flow

require("../globals")
require("../db/mongo")

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

  for (const user of users) {
    await fbapi.sendTextMessage(user.fbSenderID, "Hello there! here's your daily thing", "bidaily-reminder")
  }

  process.exit()
}

sendUpdates(hourWeCareAbout)
