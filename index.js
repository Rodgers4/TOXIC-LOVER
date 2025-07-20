const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MENU_COMMANDS = `
╭──────⊷ QUEEN BELLA COMMANDS
│.menu
│.autostatus
│.react
│.owner
│.quote
│.song
│.sticker
│.groupinfo
│.status
│.kick
│.link
│.download
│.tiktok
│.tts
│.play
│.image
│.info
│.anime
│.weather
│.help
╰──────⊷
POWERED BY RODGERS
`;

const NAME_RESPONSE = "Am Toxic lover made by Rodgers";

app.get('/', (req, res) => {
  res.send('Toxic Lover bot is live');
});

// Webhook verification
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender = event.sender.id;

        if (event.message && event.message.text) {
          const messageText = event.message.text.trim().toLowerCase();

          if (messageText === '.menu') {
            sendMessage(sender, MENU_COMMANDS);
          } else if (messageText.includes('what is your name')) {
            sendMessage(sender, NAME_RESPONSE);
          } else {
            const aiReply = await getGroqResponse(messageText);
            sendMessage(sender, aiReply || 'Sorry, AI is not responding.');
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderPsid, message) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: { id: senderPsid },
    message: { text: message },
  };

  try {
    await axios.post(url, payload);
  } catch (err) {
    console.error('Failed to send message:', err.response?.data || err.message);
  }
}

async function getGroqResponse(userInput) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are a helpful chatbot.' },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq AI Error:', error.response?.data || error.message);
    return null;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
