const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = 'rodgers4';
const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN_HERE'; // Replace with your actual token
const GROQ_API_KEY = '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';

const BOLD = t => t.replace(/(.+?)/g, (_, w) =>
  [...w].map(c =>
    String.fromCodePoint(
      /[a-z]/.test(c) ? 0x1D41A + c.charCodeAt() - 97 :
      /[A-Z]/.test(c) ? 0x1D400 + c.charCodeAt() - 65 :
      /[0-9]/.test(c) ? 0x1D7CE + c.charCodeAt() - 48 :
      c.charCodeAt()
    )
  ).join('')
);

const history = new Map();

// Send message to user
const sendMessage = async (id, msg) => {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id },
      message: { text: msg }
    });
  } catch (e) {
    console.error('Send Error:', e?.response?.data || e.message);
  }
};

// Groq GPT-4o reply function (replaces DeepSeek)
async function handleGroq(id, prompt) {
  const convo = history.get(id) || [];
  const messages = [...convo, { role: 'user', content: prompt }];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are Toxic Lover, a helpful and clever assistant by Rodgers.' },
          ...messages
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const reply = BOLD(response.data.choices[0].message.content.trim());
    await sendMessage(id, `💬 | 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑\n・────────────・\n${reply}\n・──── >ᴗ< ─────・`);
    
    history.set(id, [...messages, { role: 'assistant', content: reply }].slice(-10));
  } catch (err) {
    console.error('Groq API Error:', err.response?.data || err.message);
    await sendMessage(id, `⚠️ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 failed to respond.`);
  }
}

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook Verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Message handler
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const msg = webhookEvent.message.text.trim();
        await handleGroq(senderId, msg); // 👈 replies directly to any message
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
