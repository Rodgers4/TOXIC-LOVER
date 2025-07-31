const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🤖 TOXIC LOVER Chatbot server is live!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function(entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.trim();

        try {
          let reply;

          // 🔹 Use GPT-4o from Kaiz API
          const gptResponse = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
            params: {
              ask: userMessage
            }
          });

          if (gptResponse.data && gptResponse.data.response) {
            reply = gptResponse.data.response;
          } else {
            reply = "Sorry, GPT-4o could not respond at the moment.";
          }

          await sendTextMessage(senderId, reply);
        } catch (error) {
          console.error("GPT-4o error:", error.message);
          await sendTextMessage(senderId, "AI is not responding 😥");
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ✅ VERIFY webhook (for FB setup)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "rodgers4";
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

// 🔹 Send message back to Facebook
async function sendTextMessage(senderId, messageText) {
  const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN"; // Replace with your token

  const requestBody = {
    recipient: { id: senderId },
    message: { text: messageText }
  };

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
  } catch (error) {
    console.error("Unable to send message:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
