const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual tokens
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'rodgers4';
const KAIZ_API_KEY = '5f2fb551-c027-479e-88be-d90e5dd7d7e0';

app.use(bodyParser.json());

// Facebook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text.trim().toLowerCase();

        if (messageText === '.menu') {
          await sendText(senderId, getMenu());
        } else {
          const response = await askGpt4o(messageText);
          await sendText(senderId, response || '❌ Error contacting GPT-4o');
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Send text messages
async function sendText(senderId, text) {
  await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    messaging_type: 'RESPONSE',
    recipient: { id: senderId },
    message: { text }
  }).catch(err => console.error('Error sending message:', err.response?.data));
}

// GPT-4o API handler using Kaiz endpoint
async function askGpt4o(question) {
  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
      params: {
        ask: question,
        apikey: 5f2fb551-c027-479e-88be-d90e5dd7d7e0

        
      }
    });
    return `🤖: ${res.data.response || 'No response'}`;
  } catch (err) {
    console.error('GPT-4o error:', err.message);
    return null;
  }
}

// .menu response
function getMenu() {
  return `
╭───────────────╮
│  🛠️ QUEEN BELLA MENU
├───────────────┤
│ .menu
│ .owner
│ .autostatus
│ .react
│ .deepseek
│ .gpt4o
│ .groupinfo
│ .profile
│ .sticker
│ .tiktok
│ .song
│ .ytmp3
│ .ytmp4
│ .image
│ .quote
│ .joke
│ .meme
│ .weather
│ .location
│ .translate
╰───────────────╯
MADE BY RODGERS
🔗 View Channel: https://whatsapp.com/channel/0029VbBH9IGCnA7l7rdZlB0e
`;
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
