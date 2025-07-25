const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const received_message = webhook_event.message.text.trim();

        if (received_message === ".menu") {
          const menuMessage = `
╭───────────⊷
┋ 🌟 *QUEEN BELLA V1* 🌟
┋ Prefix: \`. \`
┋ Mode: Private AI
┣━━━━━━━━━━━━━━
┃ 🛠 *Automation*
┃ ┣ .autostatus
┃ ┣ .autoreact
┃ ┣ .autotyping
┃ ┣ .autoclear
┃ ┣ .autoemoji
┣━━━━━━━━━━━━━━
┃ 💬 *Interaction*
┃ ┣ .chatgpt
┃ ┣ .gemini
┃ ┣ .groq
┃ ┣ .blackbox
┃ ┣ .askbella
┣━━━━━━━━━━━━━━
┃ 🧠 *Utilities*
┃ ┣ .owner
┃ ┣ .repo
┃ ┣ .ping
┃ ┣ .help
┃ ┣ .about
┣━━━━━━━━━━━━━━
┃ 🎭 *Fun*
┃ ┣ .joke
┃ ┣ .meme
┃ ┣ .fact
┃ ┣ .truth
┃ ┣ .dare
┣━━━━━━━━━━━━━━
┃ 👑 POWERED BY RODGERS
╰───────────⊷
          `;
          await sendMessage(sender_psid, menuMessage);
        } else {
          const reply = await askGroq(received_message);
          await sendMessage(sender_psid, reply);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Function to send message back
async function sendMessage(sender_psid, response) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender_psid },
      message: { text: response },
    }
  );
}

// Groq AI response
async function askGroq(message) {
  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return groqRes.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq error:", err.response?.data || err.message);
    return "Sorry, I'm having trouble responding right now.";
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
