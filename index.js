const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

// FACEBOOK KEYS
const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';
const VERIFY_TOKEN = 'rodgers4';

// GEMINI AI CONFIG
const GEMINI_API_KEY = 'AIzaSyCTOyG7rkr0ZnwzuQcYCAW0qgux4fAvWpA';

// Track greeted users
const greetedUsers = new Set();

// Home route
app.get('/', (req, res) => {
  res.send('🔥 Toxic Lover Bot is Live!');
});

// Verify webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle webhook
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhook_event = entry.messaging[0];
        const sender_psid = webhook_event.sender.id;

        if (webhook_event.message && webhook_event.message.text) {
          const message = webhook_event.message.text.trim().toLowerCase();

          // Send greeting only once, and only if not .menu
          if (!greetedUsers.has(sender_psid) && message !== '.menu') {
            greetedUsers.add(sender_psid);
            await sendMessage(
              sender_psid,
              `👋 Hello, I'm *Toxic Lover*, how can I help you today?\n(Type *.menu* to explore my commands)\n\n_Powered by Rodgers_`
            );
          }

          await handleUserMessage(sender_psid, message);
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(200).send('Error handled');
  }
});

// Handle user messages
async function handleUserMessage(sender_psid, message) {
  if (message === '.menu') {
    await sendMessage(sender_psid, `
╭──────────────⊷  
┋ *💬 TOXIC LOVER COMMANDS*  
┋  
┋ .autostatus  
┋ .react  
┋ .chatbot  
┋ .fakeTyping  
┋ .say  
┋ .broadcast  
┋ .info  
┋ .owner  
┋ .qr  
┋ .help  
┋ .ai  
┋ .google  
┋ .ytmp3  
┋ .ytmp4  
┋ .sticker  
┋ .groupinfo  
┋ .invite  
┋ .shorten  
┋ .tiktokdl  
┋ .weather  
┋  
╰──────────────⊷  
_Powered by Rodgers_

👉 [View Channel](https://whatsapp.com/channel/0029VbBH9IGCnA7l7rdZlB0e)
    `);
  } else {
    const reply = await generateGeminiReply(message);
    await sendMessage(sender_psid, reply);
  }
}

// Send message to user
async function sendMessage(sender_psid, message) {
  const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const data = {
    recipient: { id: sender_psid },
    message: { text: message },
  };
  await axios.post(url, data);
}

// Gemini AI
async function generateGeminiReply(userInput) {
  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: userInput }] }],
      }
    );
    return geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to reply.";
  } catch (err) {
    console.error('Gemini Error:', err.message);
    return "Sorry, I couldn't respond. Please try again later.";
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Toxic Lover running on http://localhost:${PORT}`);
});
