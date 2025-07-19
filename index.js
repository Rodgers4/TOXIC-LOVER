const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Messenger Config
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'rodgers4';
const GEMINI_API_KEY = 'AIzaSyCTOyG7rkr0ZnwzuQcYCAW0qgux4fAvWpA';

let greetedUsers = new Set();

app.use(bodyParser.json());

// ✅ Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Messenger Event Handler
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        const msg = event.message?.text;

        if (msg) {
          if (!greetedUsers.has(senderId)) {
            await sendMessage(senderId, "👋 Hello, I'm *Toxic Lover*. How can I help you today? Or type `.menu` to explore my commands.\n\nPOWERED BY RODGERS");
            greetedUsers.add(senderId);
          }

          const lower = msg.toLowerCase();

          // Command Handling
          if (lower === '.menu') {
            await sendMessage(senderId,
`╭──────────⊷
┋ ʙᴏᴛ ɴᴀᴍᴇ : TOXIC LOVER
┋ ᴘʀᴇғɪx : .
┋ ᴍᴏᴅᴇ : AI Chat + Commands
┋
┣━━━⊷ COMMANDS
┃ .menu
┃ .owner
┃ .quote
┃ .joke
┃ .advice
┃ .fact
┃ .date
┃ .time
┃ .hello
┃ .bye
┃ .love
┃ .meme
┃ .emoji
┃ .yesno
┃ .motivate
┃ .song
┃ .poem
┃ .weather [city]
┃ .news
┃ .search [query]
┗━━━━━━━━━━━━━
POWERED BY RODGERS`);
            return;
          }

          if (lower === '.owner') {
            await sendMessage(senderId,
`👤 Name: RODGERS ONYANGO
🏠 Home: KISUMU, KENYA
📱 Status: SINGLE
📞 Cont: 0755660053
🎓 Edu: BACHELOR DEGREE
🏫 Inst: EGERTON`);
            return;
          }

          if (['what’s your name?', 'what is your name?', 'who are you?', 'who is you?'].includes(lower)) {
            await sendMessage(senderId, "I'm *Toxic Lover*, made by Rodgers from Madiaba. To learn more about him type `.owner`");
            return;
          }

          // If no command matched, reply using Gemini
          const geminiReply = await getGeminiReply(msg);
          await sendMessage(senderId, geminiReply);
        }
      }
    }
    res.sendStatus(200);
  }
});

// ✅ Send Message
async function sendMessage(senderId, msg) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      messaging_type: 'RESPONSE',
      recipient: { id: senderId },
      message: { text: msg }
    });
  } catch (err) {
    console.error('Messenger Error:', err.response?.data || err.message);
  }
}

// ✅ Gemini AI Reply
async function getGeminiReply(userText) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: userText }] }] }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that.";
  } catch (err) {
    return "I’m having trouble responding right now. Try again later.";
  }
}

app.listen(PORT, () => console.log(`✅ TOXIC LOVER bot live on port ${PORT}`));
