const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 🔐 Your Facebook credentials
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const VERIFY_TOKEN = "rodgers4";

// 🌐 AkashChat API key
const AKASH_API_KEY = "sk-yztNURhgB5u0u6alq4zxHQ";

// 🌀 Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 📩 Handle messages from Facebook
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const userMessage = event.message.text;

        // Hardcoded response for ownership
        if (userMessage.toLowerCase().includes("who is your owner")) {
          sendMessage(senderId, "My owner is Roy 😎");
        } else {
          try {
            // 🔁 Send to AkashChat
            const akashRes = await axios.post(
              "https://api.akashchat.xyz/v1/chat/completions",
              {
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: "You are TOXIC LOVER, a smart AI chatbot created by Rodgers." },
                  { role: "user", content: userMessage }
                ]
              },
              {
                headers: {
                  "Authorization": `Bearer ${AKASH_API_KEY}`,
                  "Content-Type": "application/json"
                }
              }
            );

            const botReply = akashRes.data.choices[0].message.content;
            sendMessage(senderId, botReply);
          } catch (err) {
            console.error("AkashChat Error:", err.response?.data || err.message);
            sendMessage(senderId, "Sorry, TOXIC LOVER is currently not responding 😔.");
          }
        }
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 📤 Send message to user
function sendMessage(recipientId, text) {
  axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text }
    }
  ).catch((err) => {
    console.error("Facebook Send Error:", err.response?.data || err.message);
  });
}

// 🌐 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TOXIC LOVER is live at http://localhost:${PORT}`);
});
