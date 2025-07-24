const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
require("dotenv").config();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Menu message
const menuMessage = `
╭───────────⊷
┋ 𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 💘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
╰───────────⊷
╭──── ❍ 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗜𝗢𝗡𝗦
│.autostatus
│.react
│.typing
│.autoread
│.voice
│.tagall
│.ban
│.block
│.unblock
│.broadcast
╰──────────⊷

╭──── ❍ 𝗙𝗨𝗡 / 𝗚𝗘𝗡
│.waifu
│.meme
│.anime
│.joke
│.truth
│.dare
│.lyrics <song>
│.quote
│.fact
│.advice
╰──────────⊷

╭──── ❍ 𝗨𝗧𝗜𝗟𝗦
│.ping
│.restart
│.help
│.groupinfo
│.userstats
╰──────────⊷

📎 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
`.trim();

// Verify webhook
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle messages
app.post("/", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        if (event.message && event.message.text) {
          const msg = event.message.text.toLowerCase();

          if (msg === ".menu") {
            sendText(senderId, menuMessage);
          } else if (
            msg.includes("what is your name") ||
            msg.includes("who is your owner")
          ) {
            await sendText(senderId, "I am Toxic the Roy's finest");
            await sendText(senderId, "My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒");
          } else {
            const aiResponse = await askGroq(msg);
            await sendText(senderId, aiResponse || "⚠️ Nimeshindwa kuelewa.");
            await sendText(senderId, "Type .menu to see available commands");
          }
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Groq AI
async function askGroq(userInput) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: userInput }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq error:", err.response?.data || err.message);
    return null;
  }
}

// Send response
function sendText(recipientId, message) {
  return axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    }
  );
}

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));
