const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => res.send("Toxic Lover is live!"));

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.toLowerCase();

        // Command: .menu
        if (userMessage === ".menu") {
          await sendCommandList(senderPsid);
        }

        // Command: What is your name
        else if (userMessage.includes("your name")) {
          await sendMessage(senderPsid, "I'm Toxic Lover made by Rodgers.");
        }

        // Default: Use OpenAI to respond
        else {
          try {
            const aiResponse = await axios.post(
              "https://api.openai.com/v1/chat/completions",
              {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
              }
            );

            const reply = aiResponse.data.choices[0].message.content.trim();
            await sendMessage(senderPsid, reply);
          } catch (err) {
            console.error("AI Error:", err.response?.data || err.message);
            await sendMessage(senderPsid, "I'm sorry, AI is not responding.");
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send normal message
async function sendMessage(senderPsid, response) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderPsid },
      message: { text: response },
    }
  );
}

// Send the command list
async function sendCommandList(senderPsid) {
  const commandList = `
╭───────────────⊷
┋        🤖 TOXIC LOVER COMMANDS
┋━━━━━━━━━━━━━━━━━
┋ .menu — Show command list
┋ .autostatus — Enable status viewer
┋ .react — Enable status reactions
┋ .play — Play YouTube audio
┋ .video — Download YouTube video
┋ .sticker — Convert image to sticker
┋ .quote — Random quote
┋ .meme — Get a meme
┋ .ai — Chat with AI
┋ .joke — Random joke
┋ .time — Show current time
┋ .date — Show today's date
┋ .weather — Get weather info
┋ .news — Get top headlines
┋ .translate — Translate text
┋ .image — Generate AI image
┋ .reminder — Set a reminder
┋ .shorten — Shorten URL
┋ .ping — Check bot status
┋ .source — Get bot source
╰───────────────⊷
powered by rodgers`.trim();

  await sendMessage(senderPsid, commandList);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("TOXIC LOVER is live on port", PORT);
});
