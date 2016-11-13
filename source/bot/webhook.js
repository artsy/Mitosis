// @flow

import type { $Request, $Response } from "express"
import { api } from "../facebook/api"
import { receivedAuthentication } from "./user-setup"
import { exampleFallbacks } from "./facebook_examples"
import { handlePostbacks } from "./postback-manager"
import type { MitosisUser } from "./types"
import { getOrCreateMitosisUser } from "../db/mongo"

export function botResponse(req: $Request, res: $Response) {
  var data: any = req.body

  // Make sure this is a page subscription
  if (data.object === "page") {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry: any) {
      // var pageID = pageEntry.id
      // var timeOfEvent = pageEntry.time

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent: any) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent)
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent)
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent)
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent)
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent)
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent)
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent)
        }
      })
    })

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200)
  }
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 */
async function receivedMessage(event: any) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id

  // TODO: Get a user access token from a db
  const context = await getOrCreateMitosisUser(senderID)

  var timeOfMessage = event.timestamp
  var message = event.message

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  var isEcho = message.is_echo
  var messageId = message.mid
  var appId = message.app_id
  var metadata = message.metadata

  // You may get a text or attachment but not both
  var messageText = message.text
  var messageAttachments = message.attachments
  var quickReply = message.quick_reply

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata)
    return
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload)

    handlePostbacks(context, quickReplyPayload)
    return
  }

  if (messageText) {
    switch (messageText) {
      case "random artwork":
        break

      case "random artist":
        break

      case "random article":
        break

      case "settings":
        break

      default:
        exampleFallbacks(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received")
  }
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event: any) {
  // var senderID = event.sender.id
  // var recipientID = event.recipient.id
  var delivery = event.delivery
  var messageIDs = delivery.mids
  var watermark = delivery.watermark
  // var sequenceNumber = delivery.seq

  if (messageIDs) {
    messageIDs.forEach(function(messageID: string) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID)
    })
  }

  console.log("All message before %d were delivered.", watermark)
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event: any) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback)

  const context: MitosisUser = {
    fbSenderID: senderID,
    artsyUserID: "null",
    userToken: "thingy",
    xappToken: "ok"
  }

  handlePostbacks(context, payload)
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event: any) {
  // var senderID = event.sender.id
  // var recipientID = event.recipient.id

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark
  var sequenceNumber = event.read.seq

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber)
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event: any) {
  var senderID = event.sender.id

  var status = event.account_linking.status
  var authCode = event.account_linking.authorization_code

  // TODO: This is where we hook up a recipient to Artsy,
  //       We should also correctly handle unauth'd users.
  //       even though we will need to make xapp'd requests
  //

  // var recipientID = event.recipient.id

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode)
}

/*
 * Send a text message using the Send API. Deprecated in favour of the fbapi's version'
 *
 */
export function sendTextMessage(recipientId: string, messageText: string, metadata: string = "NO_CONTEXT"): Promise<any> {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: metadata
    }
  }

  return api(messageData)
}

