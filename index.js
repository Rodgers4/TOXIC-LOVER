const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const menu = `
╭─────────────◆
│ 🤖 *TOXIC LOVER* COMMANDS:
├─────────────◆
│ 1. .menu – View commands
│ 2. .lyrics (song) – Get lyrics
│ 3. .waifu – Random anime girl
│ 4. .quote – Wise quote
│ 5. .joke – Funny joke
│ 6. .fact – Random fact
│ 7. .advice – Life advice
│ 8. .time – Current time
│ 9. .hello – Greetings
│ 10. .motivate – Motivation
│ 11. .number – Random number
│ 12. .meme – Meme URL
│ 13. .cat – Cat image
│ 14. .dog – Dog image
│ 15. .dadjoke – Dad joke
│ 16. .define (word) – Dictionary
│ 17. .synonym (word)
│ 18. .antonym (word)
│ 19. .weather (city)
│ 20. .age (dob)
│ 21. .country (code)
│ 22. .riddle – Brain teaser
│ 23. .pickup – Pickup line
│ 24. .gpt (prompt)
│ 25. .kiss
│ 26. .hug
│ 27. .cry
│ 28. .laugh
│ 29. .respect
│ 30. .dance
╰─────────────◆
𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
`;

app.get('/', (req, res) => {
  res.send('Toxic Lover Bot is Live!');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text.trim();
        await handleMessage(sender_psid, userMessage);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function handleMessage(sender_psid, message) {
  const lower = message.toLowerCase();
  let reply;

  if (lower === '.menu') {
    reply = menu;
  } else if (lower.startsWith('.lyrics')) {
    const song = message.split('.lyrics')[1]?.trim();
    reply = song ? `Lyrics for "${song}" coming soon!` : 'Please type `.lyrics song name`';
  } else if (lower === '.waifu') {
    reply = 'Here is your waifu: https://api.waifu.pics/sfw/waifu';
  } else if (lower.includes('your name') || lower.includes('who is your owner')) {
    reply = `I am Toxic the Roy's finest.\nMy owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒`;
  } else {
    // Use Groq AI for general response
    try {
      const aiRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      reply = aiRes.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Groq error:', error.message);
      reply = '⚠️ Groq AI failed to respond.';
    }
  }

  await callSendAPI(sender_psid, reply);
  await callSendAPI(sender_psid, 'Type .menu to see available commands');
}

async function callSendAPI(sender_psid, response) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
      {
        recipient: { id: sender_psid },
        message: { text: response },
      }
    );
  } catch (err) {
    console.error('Sending error:', err.response?.data || err.message);
  }
}

app.listen(port, () => {
  console.log(`Bot running on port ${port}`);
});
