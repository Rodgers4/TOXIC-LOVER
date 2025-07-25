require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;

app.post("/webhook", async (req, res) => {
  const msg = req.body.message?.toLowerCase();
  const sender = req.body.sender || "User";

  if (!msg) return res.sendStatus(400);

  // Name and Owner Special Replies
  if (msg.includes("what is your name")) {
    return res.json({ reply: "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic" });
  }

  if (msg.includes("who is your owner")) {
    return res.json({ reply: "My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒" });
  }

  // Command Menu
  if (msg === ".menu") {
    const menu = `
╔═════════════════════╗
║        🧠  𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒        ║
╠═════════════════════╣
║ 👑 Owner Commands
║   • .owner
║   • .status
║   • .mode
║
║ ⚙️ Bot Controls
║   • .autostatus
║   • .react
║   • .typing
║
║ 🖼️ Media
║   • .sticker
║   • .photo
║   • .voice
║
║ 🔐 Privacy
║   • .block
║   • .unblock
║   • .antidelete
║
║ 🎮 Fun
║   • .joke
║   • .quote
║   • .roast
║
║ 🧠 AI Commands
║   • .ask
║   • .img
║   • .gpt
╚═════════════════════╝
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
    `;
    return res.json({ reply: menu });
  }

  // Groq Chat for any other message
  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: msg }],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = groqRes.data.choices[0].message.content.trim();
    return res.json({ reply: `${aiReply}\n\nType .menu to see all cmds` });
  } catch (error) {
    console.error("Groq error:", error.response?.data || error.message);
    return res.json({ reply: "⚠️ Sorry, something went wrong with Groq AI." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
