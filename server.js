const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get("/", (req, res) => {
  res.send("Toxic Lover bot is live 💖");
});

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

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedMessage = webhookEvent.message.text.toLowerCase();

        // Static replies
        if (receivedMessage === ".menu") {
          const commandList = `
╭━━━━━━━⚙️ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓 ⚙️━━━━━━━╮
┃
┣⏺️ .sticker — Make a sticker
┣⏺️ .quote — Get a quote
┣⏺️ .joke — Random joke
┣⏺️ .meme — Random meme
┣⏺️ .advice — Life advice
┣⏺️ .fact — Fun fact
┣⏺️ .say — Repeat words
┣⏺️ .time — Current time
┣⏺️ .date — Current date
┣⏺️ .weather — Weather info
┣⏺️ .news — Latest news
┣⏺️ .anime — Anime image
┣⏺️ .lyrics — Song lyrics
┣⏺️ .calc — Calculator
┣⏺️ .search — Quick search
┣⏺️ .translate — Language tool
┣⏺️ .reminder — Set reminder
┣⏺️ .image — AI Image Gen
┣⏺️ .define — Dictionary
┣⏺️ .owner — Bot owner
┃
╰───────────⧉ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 ⧉──────────╯
          `;
          return sendMessage(senderPsid, commandList);
        }

        if (receivedMessage.includes("what is your name")) {
          return sendMessage(senderPsid, "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic");
        }

        if (receivedMessage.includes("who is your owner")) {
          return sendMessage(senderPsid, "My beloved/Intelligent/Cheeky owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒");
        }

        // GROQ AI response
        try {
          const aiResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "mixtral-8x7b-32768",
              messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: webhookEvent.message.text }
              ]
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`
              }
            }
          );

          const botReply = aiResponse.data.choices[0].message.content.trim();
          const finalReply = `${botReply}\n\nType .menu to see all cmds`;
          return sendMessage(senderPsid, finalReply);
        } catch (err) {
          console.error("Groq API Error:", err.response?.data || err.message);
          return sendMessage(senderPsid, "Oops! I couldn't respond. Please try again later.");
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

function sendMessage(senderPsid, response) {
  return axios.post(
    `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderPsid },
      message: { text: response }
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Toxic Lover is running on port " + PORT));
