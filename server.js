const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PAGE_ACCESS_TOKEN = 'EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD';
const VERIFY_TOKEN = 'rodgers4';

// Bold formatter
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

app.use(bodyParser.json());

// Facebook webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Message sender
const sendMessage = async (id, msg) => {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      messaging_type: "RESPONSE",
      recipient: { id },
      message: msg,
    });
  } catch (e) {
    console.log('Send error:', e?.response?.data || e.message);
  }
};

// Message receiver
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const messaging = entry?.messaging?.[0];
  const senderId = messaging?.sender?.id;
  const text = messaging?.message?.text?.trim();

  if (!senderId || !text) return res.sendStatus(200);

  if (text === '.menu') {
    return sendMessage(senderId, {
      text: `
╭───────────⊷
│ ⚙️ *COMMAND LIST*
├───────────
│ 🧠 GPT4o – Type any question
│ 🤖 DeepSeek – Type anything else
│ 📜 .menu – Show this menu
╰────────────⊷
POWERED BY RODGERS`
    });
  }

  // Determine model
  const useGpt = /^(who|what|when|where|how|why|tell|define|give|explain)\b/i.test(text);
  const convo = history.get(senderId) || [];
  const ask = [...convo, { role: 'user', content: text }]
    .map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    let responseText = '';
    if (useGpt) {
      // GPT4o
      const { data } = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
        params: { ask: text }
      });
      responseText = BOLD(data?.response || 'No reply from GPT.');
    } else {
      // DeepSeek
      const { data } = await axios.get('https://kaiz-apis.gleeze.com/api/deepseek-v3', {
        params: { ask: ask, apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0' }
      });
      responseText = BOLD(data?.response || 'No reply from DeepSeek.');
    }

    await sendMessage(senderId, {
      text: `💬 | 𝙰𝙸 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎\n・────────────・\n${responseText}\n・──── >ᴗ< ─────・`
    });

    history.set(senderId, [...convo, { role: 'user', content: text }, { role: 'assistant', content: responseText }].slice(-10));
  } catch (err) {
    console.error(err.message);
    await sendMessage(senderId, { text: '⚠️ AI Service Error. Try again later.' });
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Server is live');
});
