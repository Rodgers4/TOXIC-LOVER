const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get("/", (req, res) => {
  res.send("💬 Toxic Lover Facebook Bot is Live — Powered by RODGERS");
});

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

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.trim().toLowerCase();

        if (userMessage === ".menu") {
          await sendText(senderId, getCommandMenu());
        } else if (
          userMessage.includes("your name") ||
          userMessage.includes("who is your owner") ||
          userMessage.includes("what is your name")
        ) {
          await sendText(
            senderId,
            "I am Toxic the Roy's finest.\nMy owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒"
          );
        } else {
          const reply = await askGroq(userMessage);
          await sendText(senderId, `${reply}\n\nType .menu to see available commands`);
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

async function sendText(senderId, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: { text: message },
    }
  );
}

function getCommandMenu() {
  return `
╭───────────────✦  
│  𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 💬 Command List
├───────────────✦
│ 🧠 AI / Chat
│ ─ .ask [question]  
│ ─ .translate [text]  
│ ─ .define [word]  
│ ─ .chat [message]
│ ─ .ai [prompt]
│
│ 🎵 Music / Fun
│ ─ .lyrics [song]  
│ ─ .waifu  
│ ─ .quote  
│ ─ .joke  
│ ─ .advice
│
│ 📸 Image / Anime
│ ─ .animepic  
│ ─ .cat  
│ ─ .dog  
│ ─ .girl  
│ ─ .meme  
│
│ 🔧 Tools
│ ─ .calc [math]  
│ ─ .time  
│ ─ .weather [city]  
│ ─ .news  
│ ─ .wiki [query]
│
│ 🧾 Others
│ ─ .reminder  
│ ─ .motivate  
│ ─ .fact  
│ ─ .status  
│ ─ .love [name]

╰───────────────✦
𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 🌐
`;
}

async function askGroq(message) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content:
              "You are Toxic Lover, a helpful assistant. Always reply in Kiswahili if asked in Kiswahili.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    return "Samahani 😓, kuna hitilafu. Jaribu tena baadaye.";
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Toxic Lover running on port ${PORT}`);
});
