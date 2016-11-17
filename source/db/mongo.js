// @flow

const mongojs = require("mongojs")

import { getXappToken } from "../bot/artsy-api"
import { fbapi } from "../facebook/api"

import type { MitosisUser } from "../bot/types"
import { DB_URL } from "../globals"

const db = mongojs(`mongodb://${DB_URL}`, ["users", "token_lookup"])

/**
 * Gets a User for a fb sender ID
 *
 * @param {string} senderID
 * @returns {Promise<MitosisUser>} the User account representation in the db
 */

export async function getOrCreateMitosisUser(senderID: string): Promise<MitosisUser> {
  return new Promise((resolve: any, reject: any) => {
    // Check for existence
    db.users.findOne({ fbSenderID: senderID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }

      // Make a new one if not
      const data = await getXappToken()
      let fbData = { timezone: 1, first_name: "The Bot" }
      try {
        // Ensure that we have all the data we want from fb
        // The actual fb page sometimes calls this, so it can fall through
        fbData = await fbapi.getFBUserDetails(senderID)
      } catch (e) {}

      // Insert a new model
      const newUser: MitosisUser = {
        fbSenderID: senderID,
        xappToken: data.xapp_token,
        subscribeToArticlesBiDaily: false,
        timeForBiDailySub: 0,
        timezoneOffset: fbData.timezone,
        firstName: fbData.first_name
      }
      db.users.insert(newUser, (err, doc) => {
        if (err) { return reject(err) }
        if (doc) { return resolve(doc) }
      })
    })
  })
}

/**
 * Update the db representation of the user
 *
 * @param {MitosisUser} user The user JSON to update in the db
 */
export function updateMitosisUser(user: MitosisUser): Promise<MitosisUser> {
  return new Promise((resolve: any, reject: any) => {
    db.users.update({ fbSenderID: user.fbSenderID }, {$set: user}, () => {
      resolve(user)
    })
  })
}

/**
 * Look for users with the right GMT settings for a notification
 *
 * @param {number} hour The hour you're looking for
 */
export function findAllUsersWithGMTHour(hour: number): Promise<MitosisUser[]> {
  return new Promise((resolve: any, reject: any) => {
    db.users.find({ subscribeToArticlesBiDaily: true, renderedGMTTimeForArticles: hour }, (err, docs) => {
      console.log(docs)
      if (err) { reject(err) }
      else { resolve(docs) }
    })
  })
}

/**
 * Assumes a lookup-like shape
 *
 * @export
 * @param {string} senderID
 * @returns {Promise<MitosisUser>}
 */
export async function getOrCreateArtsyLookup(object: any): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    // Check for existence
    db.token_lookup.findOne({ requestID: object.requestID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }

      db.token_lookup.insert(object, (err, doc) => {
        if (err) { return reject(err) }
        if (doc) { return resolve(doc) }
      })
    })
  })
}

/**
 * Update the db representation of the user
 *
 * @param {MitosisUser} user The user JSON to update in the db
 */
export function updateArtsyLookup(tokenLookup: any): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    db.token_lookup.update({ requestID: tokenLookup.requestID }, {$set: tokenLookup}, () => {
      resolve(tokenLookup)
    })
  })
}

/**
 * Gets the lookup token via requestID, then deletes it afterwards
 * returning the one found
 *
 * @param {MitosisUser} user The user JSON to update in the db
 */
export function getAndDeleteArtsyLookup(tokenLookup: any): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    db.token_lookup.findOne({ requestID: tokenLookup.requestID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) {
        db.token_lookup.remove({ requestID: tokenLookup.requestID }, () => {
          return resolve(doc)
        })
      }
    })
  })
}
