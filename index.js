const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const VERIFY_TOKEN = "rodgers4";
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("TOXIC LOVER WEBHOOK ✅"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text.toLowerCase();

        if (webhookEvent.message.is_echo) return;

        // Greeting
        await sendMessage(
          senderId,
          "Hello, I'm Toxic Lover 💘. How can I help you today?\nOr type `.menu` to explore my commands.\n\nPOWERED BY RODGERS"
        );

        // Identity questions
        if (
          messageText.includes("your name") ||
          messageText.includes("who are you") ||
          messageText.includes("who is you") ||
          messageText.includes("you who")
        ) {
          return await sendMessage(
            senderId,
            "Am Toxic Lover, made by Rodgers from Madiaba.\nTo learn more about him type `.owner`\n\nPOWERED BY RODGERS"
          );
        }

        // .owner command
        if (messageText === ".owner") {
          return await sendMessage(
            senderId,
            `👤 Name: RODGERS ONYANGO\n📍 Home: KISUMU KENYA\n📶 Status: SINGLE\n📞 CONT: 0755660053\n🎂 AGE: 17 YEARS\n🎓 EDU: BACHELOR DEGREE\n🏫 INST: EGERTON\n\nPOWERED BY RODGERS`
          );
        }

        // .menu command
        if (messageText === ".menu") {
          return await sendMessage(
            senderId,
            `╭──────────────⊷\n┋ 𝙉𝘼𝙈𝙀 : 💻 TOXIC LOVER\n┋ 𝙋𝙍𝙀𝙁𝙄𝙓 : [ . ]\n┋ 𝙈𝙊𝘿𝙀 : PRIVATE\n╰──────────────⊷\n\nAvailable Commands:\n━━━━━━━━━━━━━━━━━\n.menu\n.owner\n.help\n.about\n.joke\n.quote\n.time\n.date\n.hug\n.kiss\n.hello\n.weather\n.story\n.advice\n.meme\n.status\n.love\n.song\n.info\n.clear\n━━━━━━━━━━━━━━━━━\n\nPOWERED BY RODGERS`
          );
        }

        // Respond using ChatGPT
        const reply = await askGPT(messageText);
        await sendMessage(senderId, `${reply}\n\nPOWERED BY RODGERS`);
      }
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderId, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: message },
      }
    );
  } catch (err) {
    console.error("Send Error:", err.message);
  }
}

async function askGPT(message) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (e) {
    return "🤖 Sorry, I had trouble thinking of a reply.";
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Toxic Lover Bot running on port ${PORT}`));
