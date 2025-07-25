const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// FB Messenger Credentials
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// GROQ AI Setup
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "mixtral-8x7b-32768"; // You can change to "llama3-70b-8192" if needed

// MENU MESSAGE
const commandMenu = `
╭━━━━━━━━━━⊷
┃ 🤖 𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 - 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨
╰━━━━━━━━━━⊷
┣ 🛠 𝗕𝗔𝗦𝗜𝗖 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
┃ ┗ .help ┃ .ping ┃ .about ┃ .status
┣ 💬 𝗖𝗛𝗔𝗧 & 𝗜𝗡𝗙𝗢
┃ ┗ .chatgpt ┃ .quote ┃ .joke ┃ .fact
┣ 🎨 𝗙𝗨𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
┃ ┗ .meme ┃ .truth ┃ .dare ┃ .roast
┣ 🛡 𝗔𝗗𝗠𝗜𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
┃ ┗ .ban ┃ .unban ┃ .warn ┃ .kick
┣ 🔍 𝗨𝗧𝗜𝗟𝗜𝗧𝗬
┃ ┗ .weather ┃ .news ┃ .define ┃ .time
┣ 💎 𝗘𝗫𝗧𝗥𝗔𝗦
┃ ┗ .owner ┃ .support ┃ .feedback ┃ .menu
╰━━━━━━━━━━⊷
🌐 POWERED BY 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
`;

// Verify Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle Incoming Messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text.trim().toLowerCase();

        // Commands
        if (userMessage === ".menu") {
          await sendMessage(sender_psid, commandMenu);
        } else if (userMessage.includes("who is your owner")) {
          await sendMessage(sender_psid, "My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒");
        } else {
          const reply = await askGroq(userMessage);
          await sendMessage(sender_psid, `${reply}\n\n🧠 Type .menu to see all cmds`);
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Send FB Message
async function sendMessage(sender_psid, message) {
  const requestBody = {
    recipient: { id: sender_psid },
    message: { text: message },
  };

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      requestBody
    );
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err.message);
  }
}

// Ask Groq
async function askGroq(question) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: GROQ_MODEL,
        messages: [{ role: "user", content: question }],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq error:", err.response?.data || err.message);
    return "⚠️ Sorry, I'm having trouble thinking right now.";
  }
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Toxic Lover bot running on port ${PORT}`));
