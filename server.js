const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PAGE_ACCESS_TOKEN = "EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD";

app.use(bodyParser.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === "rodgers4") {
    console.log("WEBHOOK VERIFIED ✅");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const message = webhook_event.message.text.toLowerCase();

        if (
          message.includes("your name") ||
          message.includes("what's your name") ||
          message.includes("who is your owner") ||
          message.includes("owner")
        ) {
          await sendMessage(
            sender_psid,
            "My name is 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 and my owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒"
          );
        } else {
          const reply = await fetchGPT4O(message);
          await sendMessage(sender_psid, reply);
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Function to send message to user
async function sendMessage(sender_psid, response) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: sender_psid },
        message: { text: response },
      }
    );
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err.message);
  }
}

// Use external GPT-4o backend
async function fetchGPT4O(prompt) {
  try {
    const res = await axios.get(
      `https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(prompt)}`
    );
    return res.data.response || "I didn't get that.";
  } catch (err) {
    console.error("GPT4O Error:", err.response?.data || err.message);
    return "Sorry, something went wrong with the AI.";
  }
}

app.listen(3000, () => {
  console.log("Toxic Lover server is live on port 3000 ✅");
});
