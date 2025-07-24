const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Verify webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;

        if (event.message && event.message.text) {
          const text = event.message.text.trim().toLowerCase();

          // Responses
          if (text === 'what is your name' || text.includes('your name')) {
            sendMessage(senderId, 'I am Toxic, the Roy\'s finest.\nMy owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒');
            return;
          }

          if (text === 'who is your owner' || text.includes('owner')) {
            sendMessage(senderId, 'My owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒');
            return;
          }

          if (text === '.menu') {
            sendMenu(senderId);
            return;
          }

          if (text.startsWith('.lyrics')) {
            const song = text.replace('.lyrics', '').trim();
            if (!song) return sendMessage(senderId, 'Please enter a song name.');
            const lyrics = `Lyrics for "${song}" not available yet. (Coming Soon 🎶)`;
            sendMessage(senderId, lyrics + '\n\nType .menu to see available commands');
            return;
          }

          if (text === '.waifu') {
            const imgUrl = `https://api.waifu.pics/sfw/waifu`;
            sendMessage(senderId, 'Here is your Waifu ❤️');
            sendImage(senderId, imgUrl);
            return;
          }

          // Default: GROK AI
          const reply = await askGroq(text);
          sendMessage(senderId, reply + '\n\nType .menu to see available commands');
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// GROQ API (mixes Kiswahili/English fluently)
async function askGroq(text) {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: `Jibu maswali yoyote kwa lugha ya Kiswahili au Kiingereza. Kuwa mkarimu, mjanja na wa msaada.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    return 'Samahani, kuna hitilafu kwenye akili ya Toxic 🤖';
  }
}

// Messenger Send API
function sendMessage(senderId, text) {
  axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: { text }
  }).catch(err => console.error('Error sending message:', err.response?.data || err.message));
}

function sendImage(senderId, imageUrl) {
  axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: 'image',
        payload: { url: imageUrl, is_reusable: true }
      }
    }
  }).catch(err => console.error('Error sending image:', err.response?.data || err.message));
}

// Stylish Command List
function sendMenu(senderId) {
  const menu = `
╭══════⪩ 𝐓𝐎𝐗𝐈𝐂 𝐌𝐄𝐍𝐔 ⪨══════╮

🧠 𝐂𝐇𝐀𝐓 𝐀𝐈
├─ .menu
├─ .waifu
├─ .lyrics (song)

🕹️ 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐎𝐑𝐒
├─ .quote
├─ .advice
├─ .define (word)
├─ .fact
├─ .joke

🎬 𝐌𝐄𝐃𝐈𝐀
├─ .song (coming soon)
├─ .video (coming soon)

👩‍💻 𝐔𝐓𝐈𝐋𝐈𝐓𝐈𝐄𝐒
├─ .time
├─ .date
├─ .weather (coming soon)
├─ .status

🎉 𝐅𝐔𝐍
├─ .truth
├─ .dare
├─ .meme
├─ .pickup

🛠️ 𝐁𝐎𝐓 𝐌𝐎𝐃𝐄
├─ .private
├─ .public
├─ .restart

╰─────────────⪩
POWERED BY: 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
  `;
  sendMessage(senderId, menu);
              }
