const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Toxic Lover is live 🔥");
});

// Webhook verification
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

// Handle messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.trim().toLowerCase();

        // Greeting only once per new conversation
        if (userMessage === "hi" || userMessage === "hello") {
          await sendMessage(
            senderId,
            "Hello am Toxic Lover, how can I help you today? 🤖\n\nType `.menu` to explore my commands.\n\nPOWERED BY RODGERS"
          );
          return;
        }

        // Custom commands
        if (userMessage === ".menu") {
          await sendMessage(
            senderId,
            "╭──────────────⊷\n" +
              "│ TOXIC LOVER COMMANDS\n" +
              "├──────────────⊷\n" +
              "│ .menu – Show command list\n" +
              "│ .owner – Info about my creator\n" +
              "│ .help – Ask for help\n" +
              "│ .joke – Tell a joke\n" +
              "│ .info – Bot info\n" +
              "│ .status – Bot status\n" +
              "╰──────────────⊷\n\nPOWERED BY RODGERS"
          );
          return;
        }

        if (
          userMessage.includes("your name") ||
          userMessage.includes("who are you") ||
          userMessage.includes("who is you")
        ) {
          await sendMessage(
            senderId,
            "Am Toxic Lover, made by Rodgers from Madiaba 😎. To learn more about him, type `.owner`"
          );
          return;
        }

        if (userMessage === ".owner") {
          await sendMessage(
            senderId,
            "👤 RODGERS ONYANGO\n🏠 KISUMU, KENYA\n📱 0755660053\n📚 BACHELOR DEGREE @ EGERTON\n💬 SINGLE\n"
          );
          return;
        }

        // If message is a question or random
        const aiResponse = await chatWithOpenAI(userMessage);
        await sendMessage(senderId, aiResponse);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Send message to user
async function sendMessage(senderId, responseText) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: responseText },
      }
    );
  } catch (error) {
    console.error("Send message error:", error.response?.data || error.message);
  }
}

// OpenAI Chat function
async function chatWithOpenAI(userInput) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userInput }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return "Sorry, I'm having trouble responding right now. Try again later.";
  }
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
