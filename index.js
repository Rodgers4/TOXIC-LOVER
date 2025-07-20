const venom = require('venom-bot');
const axios = require('axios');
require('dotenv').config();

const aiApiKey = process.env.GROQ_API_KEY;

const commands = `
╭───────────────╮
│  TOXIC LOVER MENU  │
├───────────────┤
│ .menu              │
│ .autostatus        │
│ .react             │
│ .ai [your text]    │
│ .ping              │
│ .quote             │
│ .joke              │
│ .time              │
│ .date              │
│ .sticker           │
│ .say [text]        │
│ .info              │
│ .id                │
│ .delete            │
│ .restart           │
│ .alive             │
│ .version           │
│ .shorten [url]     │
│ .weather [city]    │
│ .support           │
│ .help              │
╰───────────────╯
powered by rodgers
`;

venom
  .create()
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  client.onMessage(async (message) => {
    const msg = message.body.toLowerCase();

    if (msg === '.menu') {
      await client.sendText(message.from, commands);
    }

    if (msg === 'what is your name') {
      await client.sendText(message.from, 'Am Toxic lover made by Rodgers');
    }

    if (msg.startsWith('.ai')) {
      const prompt = message.body.replace('.ai', '').trim();
      if (!prompt) {
        return client.sendText(message.from, 'Please enter a prompt after .ai');
      }

      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${aiApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const aiText = response.data.choices[0].message.content.trim();
        await client.sendText(message.from, aiText);
      } catch (error) {
        console.error('AI ERROR:', error.response?.data || error.message);
        await client.sendText(message.from, 'Sorry, AI is not responding.');
      }
    }
  });
        }
