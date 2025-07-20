const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const verifyToken = 'rodgers4';

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming message handler
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const message = webhookEvent.message.text;

        if (message.trim().toLowerCase() === '.menu') {
          await sendTextMessage(senderId, `
╭───────────⊷
┃ .autostatus
┃ .react
┃ .ping
┃ .quote
┃ .sticker
┃ .play
┃ .tiktok
┃ .ytdl
┃ .song
┃ .meme
┃ .weather
┃ .anime
┃ .tts
┃ .scan
┃ .status
┃ .trivia
┃ .math
┃ .wiki
┃ .news
┃ .translate
╰───────────⊷
POWERED BY RODGERS`);
        } else if (message.trim().toLowerCase() === 'what is your name') {
          await sendTextMessage(senderId, 'Am Toxic lover made by Rodgers');
        } else {
          const reply = await getGroqReply(message);
          await sendTextMessage(senderId, reply);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendTextMessage(senderId, messageText) {
  const payload = {
    recipient: { id: senderId },
    message: { text: messageText },
  };

  try {
    await axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, payload);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

async function getGroqReply(userMessage) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful and intelligent chatbot made by Rodgers called Toxic Lover.' },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq error:', error.response?.data || error.message);
    return 'Sorry, I had trouble understanding. Try again.';
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Toxic Lover bot is running on port ${PORT}`);
});
