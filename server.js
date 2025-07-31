const express = require('express'); const bodyParser = require('body-parser'); const axios = require('axios'); const app = express(); const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD';

app.get('/', (req, res) => { res.send('Facebook bot server is running.'); });

app.get('/webhook', (req, res) => { const VERIFY_TOKEN = 'rodgers4'; const mode = req.query['hub.mode']; const token = req.query['hub.verify_token']; const challenge = req.query['hub.challenge'];

if (mode && token) { if (mode === 'subscribe' && token === VERIFY_TOKEN) { console.log('WEBHOOK_VERIFIED'); res.status(200).send(challenge); } else { res.sendStatus(403); } } });

app.post('/webhook', async (req, res) => { const body = req.body;

if (body.object === 'page') { for (const entry of body.entry) { for (const event of entry.messaging) { const senderId = event.sender.id;

if (event.message && event.message.text) {
      const message = event.message.text.trim();

      if (message === '.menu') {
        const menu = `

╭──────────────⊷ │    𝗧𝗢𝗫𝗜𝗖 𝗟𝗢𝗩𝗘𝗥 𝗠𝗘𝗡𝗨 ├────────────── │ .menu │ .gpt4o <question> │ .owner │ .help │ .commands │ .about │ .support │ .rules │ .group │ .invite │ .source │ .ping │ .status │ .profile │ .delete │ .botinfo │ .uptime │ .version │ .prefix │ .hi ╰──────────────⊷ POWERED BY RODGERS`; await sendMessage(senderId, { text: menu }); } else if (message.startsWith('.gpt4o')) { const args = message.split(' ').slice(1); await gpt4o.execute(senderId, args, PAGE_ACCESS_TOKEN); } else if (message.toLowerCase() === 'what is your name') { await sendMessage(senderId, { text: 'Am Toxic lover made by Rodgers' }); } else { await gpt4o.execute(senderId, [message], PAGE_ACCESS_TOKEN); } } } } res.status(200).send('EVENT_RECEIVED'); } else { res.sendStatus(404); } });

async function sendMessage(senderId, messageData) { try { await axios.post(https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}, { recipient: { id: senderId }, message: messageData, }); } catch (error) { console.error('Unable to send message:', error.message); } }

const gpt4o = { name: 'gpt4o', description: 'Chat with ChatGPT AI.', category: 'Ai', usage: 'gpt4o <question>', author: 'Kaizenji', async execute(senderId, args, pageAccessToken) { const query = args.join(' ') || 'hi'; const modifiedPrompt = query.trim();

try {
  const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o`, {
    params: {
      ask: modifiedPrompt,
      uid: senderId,
      webSearch: 'off',
      apikey: '5f2fb551-c027-479e-88be-d90e5dd7d7e0'
    }
  });

  const data = response.data;
  const formattedMessage = `۞ | 𝗖𝗵𝗮𝘁𝗚𝗣𝗧 4𝗼\n・───────────・\n${data.response}`;

  const splitMessage = (message, maxLength = 2000) => {
    const chunks = [];
    for (let i = 0; i < message.length; i += maxLength) {
      chunks.push(message.slice(i, i + maxLength));
    }
    return chunks;
  };

  const messageChunks = splitMessage(formattedMessage);

  for (const chunk of messageChunks) {
    await sendMessage(senderId, { text: chunk }, pageAccessToken);
  }
} catch (error) {
  console.error('Error message:', error.message);
  const statusCode = error.response?.status || 'Unknown';
  await sendMessage(senderId, {
    text: `[ ❌ ] 𝖤𝗋𝗋𝗈𝗋: 𝖠𝖯𝖨 𝗋𝖾𝗊𝗎𝖾𝗌𝗍 𝖿𝖺𝗂𝗅𝖾𝖽. 𝖲𝗍𝖺𝗍𝗎𝗌 𝖢𝗈𝖽𝖾: ${statusCode}\n𝖯𝗅𝖾𝖺𝗌𝖾 𝖼𝗈𝗇𝗍𝖺𝖼𝗍 𝗍𝗁𝖾 𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋.`
  }, pageAccessToken);
}

} };

app.listen(PORT, () => console.log(Server is live at http://localhost:${PORT}));

                         
