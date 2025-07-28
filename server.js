const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

const VERIFY_TOKEN = 'rodgers4';
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

const sendMessage = async (senderId, messageData) => {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: messageData
    }
  );
};

// ✅ VERIFY WEBHOOK
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// ✅ MAIN MESSAGE HANDLER
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text.toLowerCase();

        if (messageText.includes('who is your owner')) {
          return sendMessage(senderId, {
            text: 'Am Toxic lover made by Rodgers'
          });
        }

        // Only call GPT if not command
        if (!messageText.startsWith('.')) {
          try {
            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o`, {
              params: {
                ask: messageText,
                uid: senderId,
                webSearch: 'off',
                apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
              }
            });

            const data = response.data;
            const reply = `۞ | 𝗖𝗵𝗮𝘁𝗚𝗣𝗧 4𝗼\n・───────────・\n${data.response}`;

            const splitMessage = (msg, maxLength = 2000) => {
              const chunks = [];
              for (let i = 0; i < msg.length; i += maxLength) {
                chunks.push(msg.slice(i, i + maxLength));
              }
              return chunks;
            };

            const messageChunks = splitMessage(reply);
            for (const chunk of messageChunks) {
              await sendMessage(senderId, { text: chunk });
            }

          } catch (error) {
            console.error('GPT error:', error.message);
            await sendMessage(senderId, {
              text: '[ ❌ ] 𝗘𝗿𝗿𝗼𝗿: GPT API failed. Please contact Rodgers.'
            });
          }
        }
      }
    }

    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

// ✅ HOME ROUTE
app.get('/', (req, res) => {
  res.send('Toxic Lover is live!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
