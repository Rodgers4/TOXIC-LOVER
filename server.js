const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post('/', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.postback && webhook_event.postback.payload === 'GET_STARTED') {
        await sendMessage(sender_psid, "Hello there👋 am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 made by Developer 𝐑𝐎𝐃𝐆𝐄𝐑𝐒, how can I assist you today?");
      }

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text;
        try {
          const aiReply = await getGroqReply(userMessage);
          await sendMessage(sender_psid, aiReply);
        } catch (error) {
          console.error('Error responding with Groq:', error.message);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Groq AI Response
async function getGroqReply(userMessage) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: userMessage }],
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

// Send Message to Messenger
async function sendMessage(sender_psid, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender_psid },
      message: { text: message },
    }
  );
}

// Setup Get Started Button
async function setupGetStarted() {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        get_started: {
          payload: "GET_STARTED"
        }
      }
    );
    console.log("✅ 'Get Started' button setup successful.");
  } catch (error) {
    console.error("❌ Failed to setup 'Get Started':", error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server is running on port ${PORT}`);
  setupGetStarted(); // Initialize Get Started on launch
});
