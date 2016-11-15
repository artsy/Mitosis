// @flow

import { fbapi } from "../../facebook/api"
import { updateMitosisUser } from "../../db/mongo"
import type { MitosisUser } from "../types"

export const SettingsShowKey = "settings-show"
export const SettingsArticleSubscriptionKey = "settings-subscription-toggle"
export const SettingsArticleSubscriptionStartKey = "settings-subscription-update"
export const SettingsArticleSubscriptionUpdateKey = "settings-subscription-start"

/**
 * Handles pulling out the payload keys and running the appropriate function
 *
 * @export
 * @param {MitosisUser} context the user details
 * @param {string} payload a string for the lookup
 */
export function handleSettingsCallbacks(context: MitosisUser, payload: string) {
  if (payload.startsWith(SettingsShowKey)) { callbackForSettingsShow(context, payload) }
  if (payload.startsWith(SettingsArticleSubscriptionKey)) { callbackForSettingsArticleSubscriptionToggle(context, payload) }
  if (payload.startsWith(SettingsArticleSubscriptionStartKey)) { callbackForSettingsArticleSubscriptionStart(context, payload) }
  if (payload.startsWith(SettingsArticleSubscriptionUpdateKey)) { callbackForSettingsArticleSubscriptionUpdateToggle(context, payload) }
}

function showTimes(context: MitosisUser) {
  fbapi.quickReply(context.fbSenderID, "What time is good for you?", [
      { content_type: "text", title: "6am", payload: `${SettingsArticleSubscriptionStartKey}::6` },
      { content_type: "text", title: "7am", payload: `${SettingsArticleSubscriptionStartKey}::7` },
      { content_type: "text", title: "8am", payload: `${SettingsArticleSubscriptionStartKey}::8` }
  ])
}

// Shows the Settings overview
async function callbackForSettingsShow(context: MitosisUser, payload: string) {
  const toggleString = context.subscribeToArticlesBiDaily ? "Stop Daily Articles" : "Get Daily Articles"
  const subscribed = context.subscribeToArticlesBiDaily ? "not subscribed" : "subscribed"
  await fbapi.quickReply(context.fbSenderID, `You currently ${subscribed} for Article updates`, [
    { content_type: "text", title: toggleString, payload: SettingsArticleSubscriptionKey },
    context.subscribeToArticlesBiDaily ? { content_type: "text", title: "Change time", payload: SettingsArticleSubscriptionUpdateKey } : null
  ])
}

// Toggle subscription on / off. For on - it will delegate work to callbackForSettingsArticleSubscriptionStart
async function callbackForSettingsArticleSubscriptionToggle(context: MitosisUser, payload: string) {
  if (context.subscribeToArticlesBiDaily) {
    context.subscribeToArticlesBiDaily = false
    await updateMitosisUser(context)
    fbapi.sendTextMessage(context.fbSenderID, "Unsubscribed")
  } else {
    showTimes(context)
  }
}

// Only update the times
async function callbackForSettingsArticleSubscriptionUpdateToggle(context: MitosisUser, payload: string) {
  showTimes(context)
}

// Start a new subscription with a time
async function callbackForSettingsArticleSubscriptionStart(context: MitosisUser, payload: string) {
  const [, hourString] = payload.split("::")
  const hour = parseInt(hourString)
  const fbData = await fbapi.getFBUserDetails(context.fbSenderID)
  const gmtHour = hour + fbData.timezone

  // Update the local store for this user
  context.renderedGMTTimeForArticles = gmtHour
  context.subscribeToArticlesBiDaily = true
  await updateMitosisUser(context)

  await fbapi.quickReply(context.fbSenderID, `Done, you will start recieving messages at ${hour}`, [
    { content_type: "text", title: "Expansion", payload: SettingsArticleSubscriptionKey }
  ])
}
