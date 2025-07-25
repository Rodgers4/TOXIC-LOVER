const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const msgText = message.text?.body?.toLowerCase() || '';

      // Command: .menu
      if (msgText === '.menu') {
        const menuText = `
╭━〔 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 〕━⬣
┃🧠 *AI & Chat:*
┃┣ .ask
┃┣ .brainstorm
┃┣ .quote
┃┣ .explain
┃┗ .define
┃
┃🎉 *Fun:*
┃┣ .joke
┃┣ .meme
┃┣ .roast
┃┣ .fakecall
┃┗ .troll
┃
┃🛠️ *Utilities:*
┃┣ .time
┃┣ .weather
┃┣ .news
┃┣ .translate
┃┗ .calc
┃
┃📥 *Downloader:*
┃┣ .ytmp3
┃┣ .ytmp4
┃┣ .tiktok
┃┣ .fb
┃┗ .insta
╰━━━━━━━━━━━━━━━━━━━⬣
POWERED BY 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
        `;
        return sendMessage(from, menuText);
      }

      // Custom replies
      if (msgText.includes('your name')) {
        return sendMessage(from, `Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic\n\nType .menu to see all cmds`);
      }

      if (msgText.includes('your owner') || msgText.includes("who is your owner")) {
        return sendMessage(from, `My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒\n\nType .menu to see all cmds`);
      }

      // Fallback: Use Groq AI for all other queries
      const groqReply = await queryGroq(msgText);
      return sendMessage(from, `${groqReply}\n\nType .menu to see all cmds`);
    }
  }

  res.sendStatus(200);
});

async function queryGroq(prompt) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful and respectful AI girl named 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 created by SIR RODGERS.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error('Groq API error:', error.message);
    return "Oops! Something went wrong with my brain 💔.";
  }
}

function sendMessage(to, message) {
  // Simulate success (you'll replace with actual WhatsApp API or webhook reply)
  console.log(`Message sent to ${to}:`, message);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
