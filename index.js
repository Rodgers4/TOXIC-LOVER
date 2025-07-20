const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Meta verification route
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "rodgers4"; // Your verify token
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Main webhook listener
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.trim().toLowerCase();

        let replyText;

        if (userMessage === ".menu") {
          replyText = `
╭───────────────
│  🤖 TOXIC LOVER COMMANDS
├───────────────
│  .menu
│  .joke
│  .quote
│  .autostatus
│  .react
│  .ping
│  .hello
│  .chat
│  .time
│  .botinfo
│  .weather
│  .wiki
│  .news
│  .image
│  .anime
│  .status
│  .uptime
│  .support
│  .more
╰───────────────
    powered by rodgers`.trim();
        } else if (userMessage.includes("what is your name")) {
          replyText = "Am Toxic lover made by Rodgers";
        } else {
          // AI REPLY from GROQ
          replyText = await fetchGroqReply(userMessage);
        }

        await sendMessage(senderId, replyText);
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Function to send reply back to user
async function sendMessage(recipientId, messageText) {
  const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";

  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD}`,
    {
      recipient: { id: recipientId },
      message: { text: messageText },
    }
  );
}

// Groq AI Chat Completion
async function fetchGroqReply(userInput) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: userInput }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq AI error:", err.response?.data || err.message);
    return "Groq error.";
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
