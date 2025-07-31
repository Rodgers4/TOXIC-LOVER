const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD";
const VERIFY_TOKEN = "rodgers4";

// Track users who already got the welcome message
const welcomedUsers = new Set();

const commandList = `
╭───────────────⭑
│ 🤖 TOXIC LOVER COMMANDS
├───────────────
│ .menu - Show this menu
│ Gpt4o <question> - Ask GPT-4o
│ .owner - Show owner details
│ .about - About the bot
│ .hi or hi - Say hi
│ .ping - Test bot
│ .joke - Random joke
│ .time - Current time
│ .quote - Motivation
│ .fact - Random fact
│ .weather - Get weather
│ .news - Top news
│ .meme - Funny meme
│ .help - Get help
│ .love - Love quote
│ .chat - Chat random
│ .bot - Bot info
│ .creator - Creator info
│ .info - General info
│ .ai - AI options
╰───────────────⭑
POWERED BY RODGERS
`;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (!welcomedUsers.has(sender_psid)) {
        sendText(sender_psid, "👋 Hello, type Gpt4o before every text you send to get replies");
        welcomedUsers.add(sender_psid);
      }

      if (webhook_event.message && webhook_event.message.text) {
        const msg = webhook_event.message.text.trim();

        if (msg === ".menu") {
          return sendText(sender_psid, commandList);
        }

        if (msg.toLowerCase().startsWith("gpt4o")) {
          const question = msg.slice(6).trim();
          if (!question) return sendText(sender_psid, "💬 Please enter a question.");
          try {
            const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
              params: {
                ask: question,
                apikey: "5f2fb551-c027-479e-88be-d90e5dd7d7e0",
              },
            });
            const answer = data?.response || "🤖 No response.";
            return sendText(sender_psid, `💡 GPT-4o Reply:\n${answer}`);
          } catch (err) {
            return sendText(sender_psid, "⚠️ Error contacting GPT-4o.");
          }
        }

        if (msg === ".owner") {
          return sendText(sender_psid, `
👑 RODGERS ONYANGO
📍 KISUMU, KENYA
📞 0755660053
📅 AGE: 20 YEARS
🎓 EDU: BACHELOR DEGREE
🏫 INST: EGERTON
          `.trim());
        }

        // Default fallback
        sendText(sender_psid, "❗ Unknown command. Type `.menu` to see options.");
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function sendText(sender_psid, message) {
  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: sender_psid },
    message: { text: message },
  }).catch(err => {
    console.error("❌ Failed to send:", err.response?.data || err.message);
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Toxic Lover Bot is Live on port " + PORT);
});
