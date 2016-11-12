// @flow

import config from "config"

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(local: string, configName: string): string {
  return (process.env[local]) ? process.env[local] : config.get(configName)
}

/** App Secret can be retrieved from the App Dashboard */
export const APP_SECRET = getEnv("MESSENGER_APP_SECRET", "appSecret")

/** Arbitrary value used to validate a webhook */
export const VALIDATION_TOKEN = getEnv("MESSENGER_VALIDATION_TOKEN", "validationToken")

/** Generate a page access token for your page from the App Dashboard */
export const PAGE_ACCESS_TOKEN = getEnv("MESSENGER_PAGE_ACCESS_TOKEN", "pageAccessToken")

/** Artsy Client key */
export const ARTSY_API_CLIENT = getEnv("ARTSY_API_CLIENT", "artsyAPIClient")

/** Artsy Client secret */
export const ARTSY_API_SECRET = getEnv("ARTSY_API_SECRET", "artsyAPISecret")

/** This server address */
export const BOT_SERVER_URL = getEnv("BOT_SERVER_URL", "serverURL")

/** The address for Gravity */
export const GRAVITY_URL = getEnv("GRAVITY_URL", "gravityURL")

/** The address for Metaphysics */
export const METAPHYSICS_URL = getEnv("METAPHYSICS_URL", "metaphysicsURL")

/** The front-end URL route  */
export const WEB_URL = getEnv("WEB_URL", "webURL")

/** Mongo db URL  */
export const DB_URL = getEnv("DB_URL", "databaseURL")

// Normal validation stuff
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && BOT_SERVER_URL && ARTSY_API_CLIENT && ARTSY_API_SECRET && GRAVITY_URL && METAPHYSICS_URL && WEB_URL && DB_URL)) {
  console.error("Missing config values")
  process.exit(1)
}
