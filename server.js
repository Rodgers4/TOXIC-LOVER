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
  res.send("Toxic Lover is alive 🚀");
});

// === FACEBOOK WEBHOOK VERIFICATION ===
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// === MAIN WEBHOOK POST ENDPOINT ===
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMsg = webhookEvent.message.text.toLowerCase().trim();

        // === .menu Command ===
        if (userMsg === ".menu") {
          await sendTextMessage(senderId, getCommandList());
          return;
        }

        // === NAME & OWNER RESPONSES ===
        if (userMsg.includes("what is your name")) {
          await sendTextMessage(senderId, "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic\n\nType .menu to see all cmds");
          return;
        }

        if (userMsg.includes("who is your owner")) {
          await sendTextMessage(senderId, "My beloved/Intelligent/Cheeky owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒\n\nType .menu to see all cmds");
          return;
        }

        // === GROQ AI DEFAULT HANDLER ===
        try {
          const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "mixtral-8x7b-32768",
              messages: [
                { role: "system", content: "You're a sweet, techy girlfriend bot named Toxic Lover." },
                { role: "user", content: userMsg }
              ]
            },
            {
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              }
            }
          );

          const botReply = groqRes.data.choices[0].message.content;
          await sendTextMessage(senderId, botReply + "\n\nType .menu to see all cmds");
        } catch (err) {
          console.error("Groq error:", err?.response?.data || err.message);
          await sendTextMessage(senderId, "Something went wrong 😢");
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// === SEND MESSAGE TO USER ===
async function sendTextMessage(senderId, text) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: { text }
    }
  );
}

// === COMMAND LIST FUNCTION ===
function getCommandList() {
  return `
╭━💻 𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 𝗠𝗘𝗡𝗨 💻━╮
┃ 🤖 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄 : 𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥
┃ 📍 𝐌𝐎𝐃𝐄 : 𝗣𝗥𝗜𝗩𝗔𝗧𝗘
┃ 💬 𝐏𝐑𝐄𝐅𝐈𝐗 : `.`
┣━━━━━━━━━━━━━━━━━━━┫
┃ ⚙️ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟
┃ .help   .menu   .ping
┃ .status .support
┃
┃ 👥 𝗨𝗦𝗘𝗥𝗦
┃ .owner  .myname  .botinfo
┃ .age    .location
┃
┃ 🛠️ 𝗧𝗢𝗢𝗟𝗦
┃ .shorten .qr   .screenshot
┃ .time    .weather .translate
┃
┃ 🎮 𝗙𝗨𝗡
┃ .joke   .quote   .fact
┃ .advice .truth  .dare
┃
┃ 💕 𝗟𝗢𝗩𝗘
┃ .lovemeter .pickuplines
┃ .compatibility .crush
╰━━━━━━━━━━━━━━━━━━━╯
Type any command to use!
POWERED BY RODGERS
`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Toxic Lover server running on port ${PORT}`);
});
