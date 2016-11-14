// @flow

import { api } from "../facebook/api"
import { sendTextMessage } from "./webhook"
import { BOT_SERVER_URL } from "../globals"

// If we receive a text message, check to see if it matches any special
// keywords and send back the corresponding example. Otherwise, just echo
// the text we received.

export function exampleFallbacks(senderID: string, messageText: string) {
  switch (messageText) {
    case "image":
      sendImageMessage(senderID)
      break

    case "gif":
      sendGifMessage(senderID)
      break

    case "audio":
      sendAudioMessage(senderID)
      break

    case "video":
      sendVideoMessage(senderID)
      break

    case "file":
      sendFileMessage(senderID)
      break

    case "button":
      sendButtonMessage(senderID)
      break

    case "generic":
      sendGenericMessage(senderID)
      break

    case "receipt":
      sendReceiptMessage(senderID)
      break

    case "quick reply":
      sendQuickReply(senderID)
      break

    case "read receipt":
      sendReadReceipt(senderID)
      break

    case "typing on":
      sendTypingOn(senderID)
      break

    case "typing off":
      sendTypingOff(senderID)
      break

    case "account linking":
      sendAccountLinking(senderID)
      break
  }
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: BOT_SERVER_URL + "/assets/rift.png"
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a Gif using the Send API.
 */
function sendGifMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: BOT_SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: BOT_SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: BOT_SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: BOT_SERVER_URL + "/assets/test.txt"
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons: [{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: BOT_SERVER_URL + "/assets/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble"
            }]
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: BOT_SERVER_URL + "/assets/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble"
            }]
          }]
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId: string) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random() * 1000)

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: BOT_SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: BOT_SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  }

  api(messageData)
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type": "text",
          "title": "Action",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type": "text",
          "title": "Comedy",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type": "text",
          "title": "Drama",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  }

  api(messageData)
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId: string) {
  console.log("Sending a read receipt to mark message as seen")

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  }

  api(messageData)
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId: string) {
  console.log("Turning typing indicator on")

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  }

  api(messageData)
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId: string) {
  console.log("Turning typing indicator off")

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  }

  api(messageData)
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId: string) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons: [{
            type: "account_link",
            url: BOT_SERVER_URL + "/authorize"
          }]
        }
      }
    }
  }

  api(messageData)
}
