// @flow

import config from "config"

/** App Secret can be retrieved from the App Dashboard */
export const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? process.env.MESSENGER_APP_SECRET : config.get("appSecret")

/** Arbitrary value used to validate a webhook */
export const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ? (process.env.MESSENGER_VALIDATION_TOKEN) : config.get("validationToken")

/** Generate a page access token for your page from the App Dashboard */
export const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN) : config.get("pageAccessToken")

/** Artsy Client key */
export const ARTSY_API_CLIENT = (process.env.ARTSY_API_CLIENT) ? (process.env.ARTSY_API_CLIENT) : config.get("artsyAPIClient")

/** Artsy Client secret */
export const ARTSY_API_SECRET = (process.env.ARTSY_API_SECRET) ? (process.env.ARTSY_API_SECRET) : config.get("artsyAPISecret")

/** This server address */
export const SERVER_URL = (process.env.SERVER_URL) ? (process.env.SERVER_URL) : config.get("serverURL")

// Normal validation stuff
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL && ARTSY_API_CLIENT && ARTSY_API_SECRET)) {
  console.error("Missing config values")
  process.exit(1)
}
