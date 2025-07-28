const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

// Send message function
function sendMessage(recipientId, message) {
  return axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: message
    }
  );
}

// Verify webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'rodgers4';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED ✅');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;

        if (event.message && event.message.text) {
          const text = event.message.text.trim().toLowerCase();

          // Custom response for "who is your owner"
          if (text.includes('who is your owner')) {
            await sendMessage(senderId, {
              text: 'My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 and my name is 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑.'
            });
            continue;
          }

          // Use GPT-4o API to respond to any message
          try {
            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o`, {
              params: {
                ask: text,
                uid: senderId,
                webSearch: 'off',
                apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
              }
            });

            const reply = `۞ | 𝗖𝗵𝗮𝘁𝗚𝗣𝗧 4𝗼\n・───────────・\n${response.data.response}`;
            await sendMessage(senderId, { text: reply });
          } catch (error) {
            const code = error.response?.status || 'Unknown';
            await sendMessage(senderId, {
              text: `[ ❌ ] API error occurred. Status Code: ${code}`
            });
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`💬 Toxic Lover bot is live at http://localhost:${PORT}`);
});
