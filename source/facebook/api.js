// @flow

import fetch from "node-fetch"
import { PAGE_ACCESS_TOKEN } from "../globals"
import type { QuickReply, GenericElement } from "./types"

export const fbapi = {
  /**
   * Present a collection of small tappable actions, with a message body beforehand
   *
   * @export
   * @param {string} recipientId ID of person to send data to
   * @param {string} title Message body
   * @param {QuickReply[]} replies Array of replies
   * @returns {Promise<any>} The JSON response if everything is all good
   */
  quickReply(recipientId: string, title: string, replies: QuickReply[]) {
    return api({
      recipient: {
        id: recipientId
      },
      message: {
        text: title,
        quick_replies: replies
      }
    })
  },

  /**
   * Send a notification that we're thinking
   *
   * @param {string} recipientId
   */
  startTyping(recipientId: string) {
    return api({
      recipient: {
        id: recipientId
      },
      sender_action: "typing_on"
    })
  },

  /**
   * Turn off notifications that we're thinking
   *
   * @param {string} recipientId
   */
  stopTyping(recipientId: string) {
    return api({
      recipient: {
        id: recipientId
      },
      sender_action: "typing_off"
    })
  },

/**
 * Send a generic message, I tend to think of this as a
 * carousel of items to send.
 *
 * @param {string} recipientId
 * @param {GenericElement} elements
 */
  sendGenericMessage(recipientId: string, elements: GenericElement) {
    return api({
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: elements
          }
        }
      }
    })
  }
}

// TODO, migrate this function away from being exposed

/**
 * Makes a call to the Facebook API, and returns a promise wrapping the JSON body for
 * the response. Handles some rudimentary error loggin
 *
 * @param {any} message the json to send to FB
 * @returns {Promise<any>} The JSON response if everything is all good
 */
export function api(message: any): Promise<any> {
  console.log("Sending API thing:")
  console.log(JSON.stringify(message))

  return fetch(`https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    body: JSON.stringify(message),
    headers: { "Content-Type": "application/json" }
  })
  .then(checkStatus)
  .then(parseJSON)
  .then((body: any) => {
    var recipientId = body.recipient_id
    var messageId = body.message_id

    if (messageId) {
      console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId)
    } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId)
    }
    return body
  })
}

function checkStatus(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    response.json().then(json => {
      console.error("\n\nResponse from FB error")
      console.error(JSON.stringify(json))
    })
    var error = new NetworkError(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response: any) {
  return response.json()
}

/**
 * An Error type with an attached network response
 *
 * @extends {Error}
 */
export class NetworkError extends Error {
  response: any
}
