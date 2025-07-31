// ✅ TOXIC LOVER FINAL SERVER FILE

const express = require('express'); const axios = require('axios'); const bodyParser = require('body-parser'); const app = express(); const PORT = process.env.PORT || 3000;

// ✅ Add your Facebook Meta App credentials below: const VERIFY_TOKEN = 'rodgers4'; const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD'; const GPT4O_ENDPOINT = 'https://kaiz-apis.gleeze.com/api/gpt-4o'; const GPT4O_API_KEY = '5f2fb551-c027-479e-88be-d90e5dd7d7e0';

app.use(bodyParser.json());

// 🌐 Webhook Verification app.get('/webhook', (req, res) => { let mode = req.query['hub.mode']; let token = req.query['hub.verify_token']; let challenge = req.query['hub.challenge'];

if (mode && token) { if (mode === 'subscribe' && token === VERIFY_TOKEN) { console.log('WEBHOOK_VERIFIED'); res.status(200).send(challenge); } else { res.sendStatus(403); } } });

// 📩 Receive messages app.post('/webhook', async (req, res) => { const body = req.body;

if (body.object === 'page') { body.entry.forEach(async (entry) => { const webhook_event = entry.messaging[0]; const sender_psid = webhook_event.sender.id;

if (webhook_event.message && webhook_event.message.text) {
    const messageText = webhook_event.message.text;

    // 🔍 Handle AI reply for any message
    await handleGPT4OReply(sender_psid, messageText);
  }
});
res.status(200).send('EVENT_RECEIVED');

} else { res.sendStatus(404); } });

async function handleGPT4OReply(sender_psid, userMessage) { try { // 🎯 Send user message to GPT-4o endpoint const response = await axios.get(GPT4O_ENDPOINT, { params: { ask: userMessage, uid: 'toxicloveruser', webSearch: 'off', apikey: GPT4O_API_KEY, }, });

const botReply = response.data.answer || 'Sorry, no reply available.';
const decorated = '╭──────❖ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 ❖──────╮\n';

await callSendAPI(sender_psid, `${decorated}\n${botReply}`);

} catch (err) { console.error('❌ Error with GPT-4o:', err.message); await callSendAPI(sender_psid, '╭──────❖ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 ❖──────╮\nSorry, something went wrong with the AI.'); } }

// 🚀 Send message via Facebook async function callSendAPI(sender_psid, responseText) { const request_body = { recipient: { id: sender_psid, }, message: { text: responseText, }, };

try { await axios.post(https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}, request_body); } catch (err) { console.error('❌ Unable to send message:', err.message); } }

// ✅ Start server app.listen(PORT, () => console.log(✅ TOXIC LOVER BOT is live on port ${PORT}));

  
