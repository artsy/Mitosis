// @flow

import { mongojs } from "mongojs"
import { getXappToken } from "../bot/artsy-api"
import type { MitosisUser } from "../bot/types"
import { DB_URL } from "../globals"

const db = mongojs(`mongodb://${DB_URL}`, ["users"])

/**
 * Gets a User for a fb sender ID
 *
 * @param {string} senderID
 * @returns {Promise<MitosisUser>} the User account representation in the db
 */

export function getOrCreateMitosisUser(senderID: string): Promise<MitosisUser> {
  return new Promise((resolve: any, reject: any) => {
    // Check for existence
    db.users.findOne({ fbSenderID: senderID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }

      // Make a new one if not
      const data = await getXappToken()

      const newUser: MitosisUser = {
        fbSenderID: senderID,
        xappToken: data.xapp_token
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
    db.mycollection.update({ fbSenderID: user.fbSenderID }, {$inc: user}, () => {
      resolve(user)
    })
  })
}
