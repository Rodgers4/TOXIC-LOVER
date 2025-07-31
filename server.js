const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// YOUR META APP CREDENTIALS
const VERIFY_TOKEN = 'rodgers4';
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

// VERIFY WEBHOOK (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// RECEIVING MESSAGES (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        const message = event.message?.text;

        if (message) {
          const reply = await askGpt4o(message, senderId);
          await sendMessage(senderId, `👑 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑\n\n${reply}`);
        }
      }
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

// FUNCTION TO CALL GPT-4O API
async function askGpt4o(text, senderId) {
  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/gpt-4o', {
      params: {
        ask: text,
        uid: senderId,
        webSearch: 'off',
        apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
      }
    });
    return res.data.response;
  } catch (err) {
    console.error('❌ GPT API Error:', err.message);
    return '[ ❌ ] Error: AI response failed.';
  }
}

// FUNCTION TO SEND MESSAGE TO USER
async function sendMessage(senderId, text) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: senderId },
      message: { text }
    });
  } catch (err) {
    console.error('❌ Send Message Error:', err.response?.data || err.message);
  }
}

app.listen(3000, () => {
  console.log('Toxic Lover Bot running on port 3000!');
});
