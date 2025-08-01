const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "rodgers4";
const PAGE_ACCESS_TOKEN = "EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD";
const GROQ_API_KEY = "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";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        const msg = event.message?.text?.trim();

        if (!msg) continue;

        // Handle ".menu" command
        if (msg.toLowerCase() === ".menu") {
          const menu = `
╭─❍ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 ⊷  
│  
├ 📍 Smart AI powered by Groq  
├ 💬 Just type anything to get a reply  
│  
╰─❍ POWERED BY RODGERS  
`;
          await sendMessage(senderId, menu);
          continue;
        }

        // Send to Groq AI
        try {
          const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "mixtral-8x7b-32768",
              messages: [
                { role: "system", content: "You are Toxic Lover, a helpful and sweet Facebook bot created by Rodgers." },
                { role: "user", content: msg },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
              },
            }
          );

          const reply = groqRes.data.choices[0].message.content;
          await sendMessage(senderId, reply);
        } catch (error) {
          console.error("Groq Error:", error?.response?.data || error.message);
          await sendMessage(senderId, "😓 TOXIC LOVER is not responding right now. Please try again shortly.");
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(recipientId, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text },
      }
    );
  } catch (err) {
    console.error("Send Message Error:", err?.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Toxic Lover server running on port ${PORT}`);
});
