const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(bodyParser.json());

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Receive messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text;

        const reply = await getGroqResponse(userMessage);

        await sendMessage(senderId, reply + `\n\nType anything to continue chatting.`);
      }

      // Handle the "Get Started" postback
      if (webhookEvent.postback && webhookEvent.postback.payload === 'GET_STARTED') {
        await sendMessage(
          senderId,
          `Hello there👋 am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 made by Developer 𝐑𝐎𝐃𝐆𝐄𝐑𝐒, how can I assist you today?`
        );
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Function to call Groq API
async function getGroqResponse(message) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq error:', err.message);
    return 'Sorry, something went wrong while talking to my brain 😓';
  }
}

// Send message to user
async function sendMessage(recipientId, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text },
      }
    );
  } catch (err) {
    console.error('Facebook Send Error:', err.message);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
