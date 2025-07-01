const express = require("express")
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Environment variable for webhook verification token
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "your_verify_token_here"

// GET route for webhook verification (Meta requirement)
app.get("/webhook", (req, res) => {
  // Parse query parameters
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("Webhook verification attempt:", { mode, token, challenge })

  // Check if mode and token are correct
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully")
    // Return the challenge to complete verification
    res.status(200).send(challenge)
  } else {
    console.log("Webhook verification failed")
    // Return 403 Forbidden if verification fails
    res.status(403).send("Forbidden")
  }
})

// POST route for receiving webhook events
app.post("/webhook", (req, res) => {
  const body = req.body

  console.log("Received webhook event:")
  console.log("Headers:", req.headers)
  console.log("Body:", JSON.stringify(body, null, 2))

  // Process the webhook event here
  if (body.object) {
    console.log(`Webhook event for object: ${body.object}`)

    // Handle different types of webhook events
    if (body.entry) {
      body.entry.forEach((entry) => {
        console.log("Processing entry:", entry)

        // Example: Handle messaging events
        if (entry.messaging) {
          entry.messaging.forEach((event) => {
            console.log("Messaging event:", event)
          })
        }

        // Example: Handle changes events
        if (entry.changes) {
          entry.changes.forEach((change) => {
            console.log("Change event:", change)
          })
        }
      })
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).send("EVENT_RECEIVED")
  } else {
    console.log("Invalid webhook event - missing object field")
    res.status(404).send("Not Found")
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Default route - redirect to frontend
app.get("/", (req, res) => {
  res.redirect("/index.html")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`)
    console.log(`Verify token: ${VERIFY_TOKEN}`)
  })
}

module.exports = app


repo bna de

