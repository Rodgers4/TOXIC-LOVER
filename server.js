const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Your tokens
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'rodgers4';

// BOLD formatting
const BOLD = t => t.replace(/\*\*(.+?)\*\*/g, (_, w) =>
  [...w].map(c =>
    String.fromCodePoint(
      /[a-z]/.test(c) ? 0x1D41A + c.charCodeAt() - 97 :
      /[A-Z]/.test(c) ? 0x1D400 + c.charCodeAt() - 65 :
      /[0-9]/.test(c) ? 0x1D7CE + c.charCodeAt() - 48 :
      c.charCodeAt()
    )
  ).join('')
);

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Handle messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const question = webhookEvent.message.text;

        if (question.toLowerCase().includes('who is your owner')) {
          return sendMessage(senderId, { text: 'My owner is Roy 👑' });
        }

        // Ask DeepSeek
        try {
          const ask = `user: ${question}`;
          const { data } = await axios.get('https://kaiz-apis.gleeze.com/api/deepseek-v3', {
            params: {
              ask,
              apikey: '0bc1e20e-ec47-4c92-a61f-1c626e7edab7'
            }
          });

          const res = BOLD(data?.response || 'No reply.');
          await sendMessage(senderId, {
            text: `💬 | 𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔 𝚟𝟹\n・────────────・\n${res}\n・──── >ᴗ< ─────・`
          });
        } catch (error) {
          await sendMessage(senderId, { text: '⚠️ DeepSeek error.' });
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send message function
function sendMessage(senderId, response) {
  return axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: response
  }).catch(err => console.error('Send Error:', err.response?.data || err.message));
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TOXIC LOVER is live on port ${PORT}`));
