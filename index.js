const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const VERIFY_TOKEN = "rodgers4";
const GEMINI_API_KEY = "AIzaSyCTOyG7rkr0ZnwzuQcYCAW0qgux4fAvWpA";

let greetedUsers = new Set();

const COMMANDS = {
  ".menu": `
╭──────────⊷
┋ ʙᴏᴛ ɴᴀᴍᴇ: 💖 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑
┋ ᴘʀᴇғɪx: [ . ]
┋ ᴍᴏᴅᴇ: ꜰᴀᴄᴇʙᴏᴏᴋ ᴘᴀɢᴇ
┋ ᴄᴏᴍᴍᴀɴᴅꜱ:

┃ .menu
┃ .owner
┃ .joke
┃ .quote
┃ .advice
┃ .hello
┃ .time
┃ .about
┃ .support
┃ .help
┃ .bot
┃ .hi
┃ .bye
┃ .rules
┃ .contact
┃ .location
┃ .creator
┃ .motivate
┃ .status
┃ .love

╰──────────⊷
POWERED BY RODGERS
`.trim(),

  ".owner": `
👤 Name: RODGERS ONYANGO
🏠 Home: KISUMU, KENYA
📱 Status: SINGLE
📞 Contact: 0755660053
🎓 Education: BACHELOR DEGREE
🏫 Institution: EGERTON
`.trim(),

  ".hello": "Hey! I'm here.",
  ".bye": "Goodbye. See you later!",
  ".joke": "Why don’t bots tell lies? Because they get caught in loops!",
  ".quote": "“Success is not final; failure is not fatal.”",
  ".advice": "Trust the process. Consistency wins.",
  ".time": `Kenyan Time Now: ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}`,
  ".about": "I am TOXIC LOVER, a fun Facebook bot made by Rodgers.",
  ".support": "You can reach support at 0755660053.",
  ".help": "Type .menu to see what I can do!",
  ".bot": "Yes! I'm fully powered by AI.",
  ".hi": "Hello there 👋",
  ".rules": "Be kind. No spamming. Enjoy chatting!",
  ".contact": "📞 0755660053",
  ".location": "📍Kisumu, Kenya",
  ".creator": "Made by Rodgers Tech ❤️",
  ".motivate": "You are stronger than you think!",
  ".status": "Online and running 💻",
  ".love": "Love is a beautiful code 💘",
};

async function sendMessage(senderId, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      messaging_type: "RESPONSE",
      recipient: { id: senderId },
      message: { text },
    }
  );
}

app.get("/", (req, res) => res.send("Toxic Lover is Live!"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (let entry of body.entry) {
      for (let event of entry.messaging) {
        const senderId = event.sender.id;
        const message = event.message?.text;

        if (message) {
          // Greet once
          if (!greetedUsers.has(senderId)) {
            await sendMessage(senderId, `Hello, I am Toxic Lover 💖\nHow can I help you today?\n(Type .menu to explore commands)\n\nPOWERED BY RODGERS`);
            greetedUsers.add(senderId);
          }

          const lower = message.toLowerCase();

          if (COMMANDS[lower]) {
            await sendMessage(senderId, COMMANDS[lower]);
          } else if (
            lower.includes("your name") ||
            lower.includes("who are you") ||
            lower.includes("who is you")
          ) {
            await sendMessage(
              senderId,
              "I'm Toxic Lover 💕, made by Rodgers from Madiaba. Type .owner to know more."
            );
          } else {
            // Gemini AI Fallback
            const geminiRes = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
              {
                contents: [{ parts: [{ text: message }] }],
              }
            );

            const aiReply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";
            await sendMessage(senderId, aiReply);
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("TOXIC LOVER is running on port " + PORT));
