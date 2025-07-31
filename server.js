const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "Rodgers4";
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";

app.use(bodyParser.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text;

        // Special command: .menu
        if (userMessage.toLowerCase() === ".menu") {
          const menuText = `
╭─────────────⊷  
┃ ʙᴏᴛ ɴᴀᴍᴇ:  𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑  
┃ ᴘʀᴇғɪx: .
┃ ᴍᴏᴅᴇ: AI Chat  
┃─────────────
┃ .menu
┃ .help
┃ .status
┃ .joke
┃ .quote
┃ .about
┃ .ping
┃ .info
┃ .owner
┃ .support
┃ .cmds
┃ .love
┃ .random
┃ .chat
┃ .react
┃ .ask
┃ .ai
┃ .bot
┃ .whoami
┃ .date
┃ .time
╰─────────────⊷
POWERED BY RODGERS`;

          await sendMessage(senderId, menuText);
        } else {
          try {
            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(userMessage)}`);
            const botReply = response.data.reply || "I'm having trouble responding right now.";

            await sendMessage(senderId, botReply);
          } catch (err) {
            console.error("Error from AI:", err.message);
            await sendMessage(senderId, "Sorry, I'm unable to reply right now.");
          }
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Send message to user
async function sendMessage(senderId, messageText) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: messageText },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
