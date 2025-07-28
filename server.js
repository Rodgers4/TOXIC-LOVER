const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'rodgers4';

app.use(bodyParser.json());

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receiving messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text.toLowerCase();

        // Owner check
        if (messageText.includes('who is your owner') || messageText.includes('your name')) {
          await sendMessage(senderId, {
            text: `My name is 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 and my owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒`
          });
        }

        // GPT4o AI command
        else {
          const response = await getGpt4oReply(messageText, senderId);
          await sendMessage(senderId, {
            text: `۞ | 𝗖𝗵𝗮𝘁𝗚𝗣𝗧 4𝗼\n・───────────・\n${response}`
          });
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to get GPT-4o response
async function getGpt4oReply(query, senderId) {
  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
      params: {
        ask: query,
        uid: senderId,
        webSearch: 'off',
        apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
      }
    });
    return res.data.response;
  } catch (err) {
    console.error('GPT4o API Error:', err.message);
    return '[ ❌ ] GPT4o API error. Please contact Rodgers.';
  }
}

// Send message to user
async function sendMessage(senderId, message) {
  await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TOXIC LOVER is live on port ${PORT}`));
