const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "rodgers4";
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const GROQ_API_KEY = "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";

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", async (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        let userMessage = webhook_event.message.text;

        if (userMessage.toLowerCase() === ".menu") {
          const response = `
╭───────────⊷
│ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 🖤
├────────────────────────
│ 💬 Chat with AI (just message)
│ 🔍 Auto replies
│ 🧠 Smart responses
│ 📌 No commands needed!
╰──────────────⊷
POWERED BY RODGERS
          `;
          return sendMessage(sender_psid, response);
        }

        try {
          const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "mixtral-8x7b-32768",
              messages: [{ role: "user", content: userMessage }],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
              },
            }
          );

          const botReply = groqRes.data.choices[0].message.content;
          await sendMessage(sender_psid, botReply);
        } catch (err) {
          console.error("❌ AI Error:", err.response?.data || err.message);
          await sendMessage(sender_psid, "😭 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 is not responding right now. Please try again later.");
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(sender_psid, response) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender_psid },
      message: { text: response },
    }
  );
}

app.listen(3000, () => {
  console.log("🚀 Server is live at http://localhost:3000");
});
