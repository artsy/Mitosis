// @flow

import { fbapi } from "../../facebook/api"
import { updateMitosisUser } from "../../db/mongo"
import type { MitosisUser } from "../types"
import { showMainMenu } from "./main-menu"

export const SettingsShowKey = "settings-show"
export const SettingsLoginKey = "settings-login"
export const SettingsLogoutKey = "settings-logout"
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
  if (payload.startsWith(SettingsLoginKey)) { callbackForLogin(context, payload) }
  if (payload.startsWith(SettingsLogoutKey)) { callbackForLogout(context, payload) }
}

/**
 * Shows the potential times for a user to sign up, my wife was annoyed at only
 * having morning options, so now we also show evening options.
 *
 * @param {MitosisUser} context
 */
function showTimes(context: MitosisUser) {
  fbapi.quickReply(context.fbSenderID, "What time is good for you?", [
      { content_type: "text", title: "6am", payload: `${SettingsArticleSubscriptionStartKey}::6::6am` },
      { content_type: "text", title: "7am", payload: `${SettingsArticleSubscriptionStartKey}::7::7am` },
      { content_type: "text", title: "8am", payload: `${SettingsArticleSubscriptionStartKey}::8::8am` },
      { content_type: "text", title: "6pm", payload: `${SettingsArticleSubscriptionStartKey}::18::6pm` },
      { content_type: "text", title: "7pm", payload: `${SettingsArticleSubscriptionStartKey}::19::7pm` }
  ])
}

// Shows the Settings overview
async function callbackForSettingsShow(context: MitosisUser, payload: string) {
  const toggleString = context.subscribeToArticlesBiDaily ? "Stop Daily Articles" : "Get Daily Articles"
  const subscribed = context.subscribeToArticlesBiDaily ? "subscribed" : "not subscribed"
  const loggedIn = context.artsyUserID !== undefined
  const artsyLoggedIn = loggedIn ? "logged in" : "not logged in"
  const artsyLoggedInTitle = loggedIn ? "Log Out" : "Log In"
  const artsyLoggedInPayload = loggedIn ? SettingsLogoutKey : SettingsLoginKey

  await fbapi.quickReply(context.fbSenderID, `You currently ${subscribed} for Article updates, and are ${artsyLoggedIn} to Artsy.`, [
    { content_type: "text", title: toggleString, payload: SettingsArticleSubscriptionKey },
    { content_type: "text", title: artsyLoggedInTitle, payload: artsyLoggedInPayload },
    context.subscribeToArticlesBiDaily ? { content_type: "text", title: "Change time", payload: SettingsArticleSubscriptionUpdateKey } : null
  ])
}

// Shows the Settings overview
async function callbackForLogin(context: MitosisUser, payload: string) {
  fbapi.showLoginScreen(context.fbSenderID)
}

async function callbackForLogout(context: MitosisUser, payload: string) {
  fbapi.showLogout(context.fbSenderID)
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

// Start a new subscription with a time, then show the main menu after confirming
async function callbackForSettingsArticleSubscriptionStart(context: MitosisUser, payload: string) {
  const [, hourString, hourPretty] = payload.split("::")
  const hour = parseInt(hourString)
  const fbData = await fbapi.getFBUserDetails(context.fbSenderID)
  const gmtHour = hour + fbData.timezone

  // Update the local store for this user
  context.renderedGMTTimeForArticles = gmtHour
  context.subscribeToArticlesBiDaily = true
  await updateMitosisUser(context)

  const congratsAndMainMenu = `Done, you will start recieving messages at ${hourPretty}.\n\nThose will start from tomorrow, in the mean time you are welcome to explore Artsy from here, you can start with these:`
  showMainMenu(context, congratsAndMainMenu)
}
