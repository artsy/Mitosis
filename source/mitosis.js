// @flow

import express from "express"
import bodyParser from "body-parser"

// import request from "request"
// import fetch from "node-fetch"

// import { verifyRequestSignature } from "./facebook/facebook-comms"
// app.use(bodyParser.json({ verify: verifyRequestSignature }))

require("./globals")

// Error logging
process.on("unhandledRejection", function(reason: string, p: any) {
  console.log("Error: ", reason)
})

const app = express()
app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(express.static("public"))

import { validation, authorise } from "./facebook/facebook-user-creds"
// Handles authorizing to FB
app.get("/authorize", authorise)
// Handles FB app setup requests
app.get("/webhook", validation)

import { botResponse } from "./bot/webhook"
app.post("/webhook", botResponse)

// Start server
app.listen(app.get("port"), function() {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)
})
