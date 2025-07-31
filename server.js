const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'rodgers4';

const app = express();
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text;

        try {
          const response = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
            params: {
              ask: userMessage,
              uid: senderId,
              webSearch: 'off',
              apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
            }
          });

          const aiReply = response.data.response;
          const formatted = `⚡ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑\n━━━━━━━━━━━━━━━━━━\n${aiReply}`;

          await sendMessage(senderId, formatted);
        } catch (error) {
          console.error('API error:', error.message);
          const code = error.response?.status || 'Unknown';
          await sendMessage(senderId, `[ ❌ ] API Error. Code: ${code}`);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderId, message) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: senderId },
      message: { text: message }
    });
  } catch (err) {
    console.error('Failed to send message:', err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Toxic Lover bot running on port ${PORT}`);
});
