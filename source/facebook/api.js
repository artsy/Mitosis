// @flow

import fetch from "node-fetch"
import { PAGE_ACCESS_TOKEN } from "../globals"
import type { QuickReply, GenericElement, FBButton } from "./types"

export const fbapi = {
  /**
   * Present a collection of small tappable actions, with a message body beforehand.
   * Feel free to send nulls in the array, they will be filtered. Title cannot be empty.
   *
   * @export
   * @param {string} recipientId ID of person to send data to
   * @param {string} title Message body
   * @param {QuickReply[]} replies Array of replies
   * @returns {Promise<any>} The JSON response if everything is all good
   */
  quickReply(recipientId: string, title: string, replies: Array<?QuickReply>) {
    if (title.length === 0) {
      console.error("Empty string sent to quickReply")
      return {}
    }
    return api({
      recipient: {
        id: recipientId
      },
      message: {
        text: title.slice(0, 20),
        quick_replies: replies.filter((r) => r !== null).map((r) => sanitiseQuickReply(r))
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
 * Send a collection of elements, effectively making a carousel
 *
 * @param {string} recipientId
 * @param {GenericElement} elements
 */
  elementCarousel(recipientId: string, elements: GenericElement[]) {
    return api({
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: elements.slice(0, 10).map((e) => sanitiseElement(e))
          }
        }
      }
    })
  },

  sendTextMessage(recipientId: string, messageText: string, metadata: string = "NO_CONTEXT") {
    if (messageText.length === 0) {
      console.error("Empty string sent to messageText")
      return {}
    }
    return api({
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText.slice(0, 300),
        metadata: metadata
      }
    })
  }
}

// NOTE:
// The FB API doesn't crop texts being sent to it, so we'll do it before sending anything up
// meaning the app itself doesn't care about implementation details like that.

function sanitiseQuickReply(reply: QuickReply): QuickReply {
  var safeReply: QuickReply = {
    title: reply.title.slice(0, 19),
    content_type: reply.content_type,
    payload: reply.payload
  }
  return safeReply
}

/**
 * Converts a button into one that won't fail the network request
 *
 * @param {FBButton} button
 * @returns {FBButton} safe version of the button
 */
function sanitiseButton(button: FBButton): FBButton {
  var safeButton: FBButton = {
    type: button.type,
    title: button.title.slice(0, 30)
  }
  if (button.url) { safeButton.url = button.url }
  if (button.payload) { safeButton.payload = button.payload.slice(0, 300) }
  return safeButton
}

/**
 * Converts a GenericElement into a safe version for the API
 *
 * @param {GenericElement} element
 * @returns {GenericElement} a afer version
 */
function sanitiseElement(element: GenericElement): GenericElement {
  var safeElement: GenericElement = {
    title: element.title.slice(0, 60),
    item_url: element.item_url,
    image_url: element.image_url
  }
  if (element.subtitle) { safeElement.subtitle = element.subtitle.slice(0, 300) }
  if (element.buttons) { safeElement.buttons = element.buttons.slice(0, 6).map((e) => sanitiseButton(e)) }
  return safeElement
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
