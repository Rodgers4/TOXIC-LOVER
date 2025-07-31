const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = 'rodgers4';
const PAGE_ACCESS_TOKEN = 'EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD'; // Replace with your real token

// Convert plain text to bold Unicode
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

// DeepSeek v3 reply function
async function handleDeepSeek(id, prompt) {
  const convo = history.get(id) || [];
  const ask = [...convo, { role: 'user', content: prompt }]
    .map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/deepseek-v3', {
      params: {
        ask,
        apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
      }
    });

    const reply = BOLD(res.data?.response || "No reply.");
    await sendMessage(id, `💬 | 𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔 𝚟𝟹\n・────────────・\n${reply}\n・──── >ᴗ< ─────・`);
    history.set(id, [...convo, { role: 'user', content: prompt }, { role: 'assistant', content: reply }].slice(-10));
  } catch (err) {
    await sendMessage(id, `⚠️ DeepSeek Error: Could not respond.`);
  }
}

// Facebook webhook verification
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
        await handleDeepSeek(senderId, msg); // 💬 Respond directly to any message
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
