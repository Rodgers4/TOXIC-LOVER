const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const VERIFY_TOKEN = "rodgers4";

const sentWelcome = new Set(); // Tracks who has received welcome

// DeepSeek API endpoint
const deepSeekAPI = "https://api.deepseek.com/chat";
const deepSeekAPIKey = "5f2fb551-c027-479e-88be-d90e5dd7d7e0";

// Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        if (event.message && event.message.text) {
          const userMessage = event.message.text;

          // Send welcome message once
          if (!sentWelcome.has(senderId)) {
            await sendMessage(senderId, "Hello 👋, I'm Toxic Lover made by Rodgers. Just send a message to chat with me!");
            sentWelcome.add(senderId);
          }

          try {
            const deepseekRes = await axios.post(deepSeekAPI, {
              messages: [{ role: "user", content: userMessage }],
              model: "deepseek-chat"
            }, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${deepSeekAPIKey}`
              }
            });

            const reply = deepseekRes.data.choices?.[0]?.message?.content || "Hmm... I didn't get that.";
            await sendMessage(senderId, reply);
          } catch (error) {
            console.error("DeepSeek error:", error.message);
            await sendMessage(senderId, "Sorry, AI is not responding right now 😔");
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send a message via Facebook
async function sendMessage(recipientId, text) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text: text }
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Toxic Lover is live on port " + PORT));
