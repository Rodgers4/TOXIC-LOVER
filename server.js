const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

// ✅ Your Facebook Page Token & Verification Token
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const VERIFY_TOKEN = "rodgers4";

app.use(bodyParser.json());

// ✅ Messenger Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Message Receiver
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const userText = event.message.text;

        try {
          // ✅ Call Kaiz GPT-4o API
          const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(userText)}&uid=${senderId}&webSearch=Google&apikey=5f2fb551-c027-479e-88be-d90e5dd7d7e0`;

          const apiRes = await fetch(apiUrl);
          const apiData = await apiRes.json();
          const botReply = apiData.reply || "Sorry, no reply came back.";

          // ✅ Send Reply via Messenger
          await sendMessage(senderId, botReply);
        } catch (error) {
          console.error("Error talking to Kaiz API:", error);
          await sendMessage(senderId, "Oops, an error occurred while responding.");
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ✅ Send message to Facebook user
async function sendMessage(senderId, text) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: text },
  };

  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageData),
  });
}

// ✅ Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TOXIC LOVER bot is live on port ${PORT}`);
});
