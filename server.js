const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const verifyToken = 'rodgers4';
const pageToken = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

app.use(bodyParser.json());

const usersWelcomed = new Set();

// Webhook verification
app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Message handler
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const event = entry?.messaging?.[0];
  const senderId = event?.sender?.id;
  const message = event?.message?.text;

  if (!senderId || !message) return res.sendStatus(200);

  // Send welcome message only once per user
  if (!usersWelcomed.has(senderId)) {
    usersWelcomed.add(senderId);
    return sendMessage(senderId, {
      text: '👋 Hello, type Gpt4o before every text you send to get replies.',
    }, pageToken);
  }

  // Handle .menu
  if (message.trim().toLowerCase() === '.menu') {
    return sendMessage(senderId, {
      text: `╭─────⊷
│ 🛠️ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓
├─────────────────────
│ .menu
│ .deepseek
│ .about
│ .help
│ .owner
│ .ping
│ .info
│ .version
│ .support
│ .status
│ .random
│ .quote
│ .time
│ .date
│ .joke
│ .weather
│ .news
│ .ai
│ .gpt
│ .clear
╰───────────────⊷
POWERED BY RODGERS`,
    }, pageToken);
  }

  // Handle DeepSeek using your provided logic
  if (message.toLowerCase().startsWith('gpt4o')) {
    const axios = require('axios');
    const ask = message.replace(/^gpt4o/i, '').trim();
    if (!ask) return sendMessage(senderId, { text: '💬 Ask something after "Gpt4o".' }, pageToken);

    try {
      const { data } = await axios.get('https://kaiz-apis.gleeze.com/api/deepseek-v3', {
        params: {
          ask: `user: ${ask}`,
          apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0',
        },
      });

      const res = data?.response || 'No reply.';
      return sendMessage(senderId, {
        text: `💬 | 𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔 𝚟𝟹\n・────────────・\n${res}\n・──── >ᴗ< ─────・`,
      }, pageToken);
    } catch {
      return sendMessage(senderId, { text: '⚠️ DeepSeek v3 error.' }, pageToken);
    }
  }

  res.sendStatus(200);
});

function sendMessage(id, msg, token) {
  const axios = require('axios');
  return axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${token}`, {
    recipient: { id },
    message: msg,
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot server running on port ${PORT}`));
