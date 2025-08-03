const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// 🌐 Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const 
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry 
      const event = entry.messaging[0];
      const se
        const userMessage = event.message.text;

        // AkashChat API call
        try {
          const response = await axios.post('https://api.akashchat.tech/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userMessage }],
          }, {
            headers: {
              'Authorization': `Bearer ${AKASH_API_KEY}`,
              'Content-Type': 'application/json',
            }
          });

          const botReply = response.data.choices[0].message.content;
          await sendReply(sender, botReply);
        } catch (error) {
          console.error('💥 Akash API Error:', error.message);
          await sendReply(sender, '⚠️ Sorry, I had trouble replying.');
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// 💬 Send reply to user
async function sendReply(recipientId, messageText) {
  await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: recipientId },
    message: { text: messageText }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
