const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(bodyParser.json());

// VERIFY WEBHOOK
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Webhook Verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// HANDLE MESSAGES
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text.trim().toLowerCase();

        let reply;

        // COMMAND HANDLERS
        if (userMessage.startsWith('.menu')) {
          reply = decoratedMenu();
        } else if (userMessage.startsWith('.lyrics')) {
          const song = userMessage.replace('.lyrics', '').trim();
          reply = await getLyrics(song);
        } else if (userMessage.startsWith('.waifu')) {
          reply = await getWaifuImage();
        } else if (userMessage.includes('your name') || userMessage.includes('who is your owner')) {
          reply = "I am Toxic the Roy's finest. My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒";
        } else {
          reply = await askGroq(userMessage);
        }

        reply += "\n\nType .menu to see available commands";
        await sendMessage(sender_psid, reply);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Toxic Lover bot is running.');
});

// Send Message to Messenger
async function sendMessage(sender_psid, response) {
  await axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: sender_psid },
    message: { text: response }
  }).catch(e => console.error('Send error:', e.response?.data));
}

// Groq AI
async function askGroq(message) {
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: message }],
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("Groq error:", err.response?.data);
    return "Sorry, I couldn't process that.";
  }
}

// Lyrics command
async function getLyrics(song) {
  try {
    const res = await axios.get(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(song)}`);
    return `🎶 ${res.data.title} by ${res.data.author}\n\n${res.data.lyrics}`;
  } catch {
    return "Lyrics not found. Try another song.";
  }
}

// Waifu command
async function getWaifuImage() {
  try {
    const res = await axios.get('https://api.waifu.pics/sfw/waifu');
    return `Here's a Waifu for you 💖\n${res.data.url}`;
  } catch {
    return "Failed to fetch waifu. Try again.";
  }
}

// Decorated Menu
function decoratedMenu() {
  return `
╭─────「 💀 TOXIC LOVER MENU 💀 」─────╮
│ 1. .lyrics [song] - Get lyrics
│ 2. .waifu - Get anime girl
│ 3. .quote - Inspiring quote
│ 4. .advice - Random advice
│ 5. .fact - Interesting fact
│ 6. .joke - Tell a joke
│ 7. .truth - Truth dare
│ 8. .dare - Dare you
│ 9. .bored - Bored suggestion
│10. .math [eqn] - Solve math
│11. .chat [msg] - Talk with AI
│12. .age [name] - Guess age
│13. .gender [name] - Predict gender
│14. .dog - Random dog
│15. .cat - Random cat
│16. .define [word] - Dictionary
│17. .quoteanime - Anime quote
│18. .weather [city]
│19. .emoji [word] - Emojify
│20. .meme - Get meme
│21. .number [fact] - Number fact
│22. .bible [verse] - Bible verse
│23. .screenshot [url]
│24. .topic - Random topic
│25. .ping - Bot response time
│26. .reminder [text]
│27. .poem [topic]
│28. .horoscope [sign]
│29. .insult - Roast me
│30. .translate [text]
╰───────────────⊷  
𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
`;
                   }
