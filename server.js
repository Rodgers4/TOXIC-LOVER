const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const thickLine = "╭━━━━━━━━━━━━━━━━━━━━━⊷";
const commandList = `
${thickLine}
┋ ʙᴏᴛ ɴᴀᴍᴇ :  𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑
┋ ᴘʀᴇғɪx : .
┋ ᴍᴏᴅᴇ : PRIVATE
${thickLine}
┣━━⪼ GENERAL CMDS
┃ • .menu
┃ • .ping
┃ • .info
┃ • .rules
┣━━⪼ GROUP CMDS
┃ • .kick
┃ • .add
┃ • .promote
┃ • .demote
┃ • .tagall
┣━━⪼ FUN CMDS
┃ • .joke
┃ • .quote
┃ • .meme
┃ • .truth
┃ • .dare
┣━━⪼ UTILITY CMDS
┃ • .weather
┃ • .translate
┃ • .time
┃ • .define
┃ • .reminder
${thickLine}
┋ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
${thickLine}
`;

app.post("/webhook", async (req, res) => {
  const message = req.body?.message?.toLowerCase() || "";
  let reply = "";

  if (!message) return res.sendStatus(200);

  if (message === ".menu") {
    reply = commandList;
  } else if (message.includes("what is your name")) {
    reply = "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic";
  } else if (message.includes("who is your owner")) {
    reply = "My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒";
  } else {
    try {
      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: "You are TOXIC LOVER, a loyal and intelligent female bot created by SIR RODGERS. Always be respectful, polite, and sweet.",
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
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
        }
      );

      reply = groqRes.data.choices[0].message.content + "\n\nType .menu to see all cmds";
    } catch (error) {
      console.error("Groq API error:", error.message);
      reply = "Sorry, I couldn't process that. Please try again.\n\nType .menu to see all cmds";
    }
  }

  return res.json({ reply });
});

app.get("/", (req, res) => {
  res.send("💖 TOXIC LOVER BOT SERVER IS RUNNING 💖");
});

app.listen(port, () => {
  console.log(`✅ TOXIC LOVER bot server running at http://localhost:${port}`);
});
