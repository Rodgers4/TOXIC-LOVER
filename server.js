const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Page Access Token and Verify Token
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';
const VERIFY_TOKEN = 'Rodgers4';

app.use(bodyParser.json());

// Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge); // Should respond with 1234 during test
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
        const userMessage = webhookEvent.message.text;

        // Special command to return .menu
        if (userMessage === '.menu') {
          const menuText = `
╭───────────────
│  𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 - 𝗠𝗘𝗡𝗨
├───────────────
│ • .menu
│ • .owner
│ • .gpt4o [ask]
│ • .about
│ • .quote
│ • .help
╰───────────────
POWERED BY RODGERS`;

          await sendMessage(senderId, menuText);
        } else {
          // Send user query to GPT-4o backend
          try {
            const resAI = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o`, {
              params: {
                ask: userMessage,
                uid: senderId,
                webSearch: 'off',
                apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0',
              },
            });

            const reply = resAI.data?.response || 'No response from AI.';
            const responseMessage = `۞ | 𝗖𝗵𝗮𝘁𝗚𝗣𝗧 4𝗼\n・───────────・\n${reply}`;

            await sendMessage(senderId, responseMessage);
          } catch (error) {
            console.error('AI API error:', error.message);
            await sendMessage(senderId, '[ ❌ ] Failed to get AI response. Contact developer.');
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Function to send message
async function sendMessage(senderId, text) {
  await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: { text },
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
