const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";

app.use(bodyParser.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "rodgers4";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
});

// Message handler
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const message = webhook_event.message.text.trim().toLowerCase();

        // .menu command
        if (message === ".menu") {
          const menuText = `
╭───『 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐁𝐎𝐓 』───╮
│ .menu        – Show this menu
│ .help        – Assistance
│ .autostatus  – Enable Auto Status
│ .react       – Auto Emoji Reaction
│ .viewstatus  – View WhatsApp Status
│ .owner       – Show Bot Owner
│ .ai          – Talk to AI
│ .joke        – Random Joke
│ .quote       – Daily Quote
│ .love        – Love Message
│ .fake        – Fake Typing
│ .info        – User Info
│ .chatbot     – Toggle Chat Mode
│ .about       – Bot Details
│ .group       – Group Tools
│ .tools       – Extra Tools
│ .fun         – Fun Commands
│ .image       – Generate Image
│ .weather     – Weather Info
│ .news        – Latest News
│ .date        – Current Date
│ .time        – Current Time
╰─────── 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 ─────╯
          `;
          await sendMessage(senderId, { text: menuText });
        } else {
          // Ask GPT-4o using your API key
          try {
            const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
              params: {
                ask: message,
                apikey: "5f2fb551-c027-479e-88be-d90e5dd7d7e0"
              }
            });

            const botReply = data?.response || "🤖 Sorry, no response.";
            await sendMessage(senderId, { text: botReply });
          } catch (error) {
            console.error("GPT-4o error:", error.message);
            await sendMessage(senderId, { text: "⚠️ Error contacting GPT-4o." });
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send message
async function sendMessage(senderId, message) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: message
    }
  );
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server live on port ${PORT}`));
