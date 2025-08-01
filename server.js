const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const token = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const verifyToken = "rodgers4";
const GROQ_API_KEY = "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";

app.use(bodyParser.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];
  if (mode && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Message handler
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const messageObj = changes?.value?.messages?.[0];

  if (!messageObj) return res.sendStatus(200);

  const sender = messageObj.from;
  const userMessage = messageObj.text?.body;

  if (!userMessage) return res.sendStatus(200);

  // Decorative .menu style response
  if (userMessage.toLowerCase().includes("menu")) {
    const menu = `
╭─────────────⊷
┋ ʙᴏᴛ ɴᴀᴍᴇ : 🤖 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑
┋ ᴍᴏᴅᴇ : AUTO AI
┋ ᴍᴀᴅᴇ ʙʏ : 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
╰─────────────⊷

𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐧𝐞𝐞𝐝𝐞𝐝.
𝐓𝐲𝐩𝐞 𝐚𝐧𝐲 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐰𝐢𝐥𝐥 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 🧠.
`;

    await sendMessage(sender, menu);
    return res.sendStatus(200);
  }

  try {
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are Toxic Lover, a helpful AI created by Rodgers. Answer questions briefly and smartly.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = groqResponse.data.choices?.[0]?.message?.content || "⚠️ AI failed to respond. Try again later.";
    await sendMessage(sender, aiReply);
  } catch (err) {
    await sendMessage(sender, "🥺 Sorry, TOXIC LOVER is not responding right now.");
    console.error("Groq Error:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

// Function to send a message back to user
async function sendMessage(recipientId, message) {
  await axios.post(
    `https://graph.facebook.com/v19.0/212969038072564/messages`,
    {
      messaging_product: "whatsapp",
      to: recipientId,
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("TOXIC LOVER SERVER LIVE ON PORT", PORT);
});
