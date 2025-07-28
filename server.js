const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// 🔐 Access Token (HARD-CODED)
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

// 📥 Verify webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'rodgers4';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📤 Handle messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const text = event.message.text.toLowerCase();

        if (text.includes('who is your owner') || text.includes('who made you')) {
          return await sendMessage(senderId, {
            text: 'My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 and my name is 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑'
          });
        }

        // 🤖 Use GPT-4o for any other message
        try {
          const response = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
            params: {
              ask: text,
              uid: senderId,
              webSearch: 'off',
              apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
            }
          });

          const reply = response.data.response;
          await sendMessage(senderId, { text: `🤖 𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥:\n${reply}` });
        } catch (err) {
          console.error(err.message);
          await sendMessage(senderId, {
            text: '[❌] Error replying using GPT-4o. Contact Developer.'
          });
        }
      }
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 📬 Function to send a message
async function sendMessage(recipientId, message) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: message
    }
  );
}

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
