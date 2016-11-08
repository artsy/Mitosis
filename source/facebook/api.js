// @flow

import fetch from "node-fetch"
import { PAGE_ACCESS_TOKEN } from "../globals"

/**
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
export function api(message: any = {}): Promise<Response> {
  console.log("Sending API thing:")
  console.log(JSON.stringify(message))

  return fetch(`https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    body: JSON.stringify(message),
    headers: { "Content-Type": "application/json" }
  })
  .then(checkStatus)
  .then(parseJSON)
  .then(function(body: any) {
    var recipientId = body.recipient_id
    var messageId = body.message_id

    if (messageId) {
      console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId)
    } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId)
    }
  })
}

function checkStatus(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    response.json().then(json => {
      console.error("\n\nResponse error")
      console.error(JSON.stringify(json))
    })
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response: any) {
  return response.json()
}

