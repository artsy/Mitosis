// @flow

import { fbapi } from "../facebook/api"

/**
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
export async function receivedAuthentication(event: any) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfAuth = event.timestamp

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth)

  const details = await fbapi.getFBUserDetails(senderID)

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  fbapi.sendTextMessage(senderID, `Welcome ${details.first_name} to the Artsy bot. To get started, try saying replying with either 'trending artists' or 'new articles'`)
}
