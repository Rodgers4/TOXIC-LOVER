const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "rodgers4";
const PAGE_ACCESS_TOKEN = "EAARnZBLCwD9EBPGn3bIcMgW37Nw9uBnWZAADLuh0FcwIBOF94FyZAE9z6hYP6mZCCfnp3kuAhTJTFnVhRHrcieKl2S4ZCeymyqO6BLZAeyI619sPgsJNEvcPnCvMD0jKFJ6wdcDdk2ZBqb3SS3LnCP6IP0GSykKTHj3WTYeafUUAjCXE5f61Yt1sEG1JI37f3WYZC7SQSOmMtwZDZD"; // replace this

// Messenger Webhook Verification
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

// Incoming Messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userText = webhook_event.message.text;

        try {
          const response = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
            params: { ask: userText },
          });

          const reply = response.data.reply || "🤖 No reply found.";
          await sendMessage(sender_psid, { text: reply });
        } catch (error) {
          console.error("GPT-4o Error:", error.message);
          await sendMessage(sender_psid, {
            text: "⚠️ GPT-4o is not responding right now. Try again shortly.",
          });
        }
      }
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

// Message Sender
async function sendMessage(recipientId, message) {
  try {
    await axios.post(
      "https://graph.facebook.com/v18.0/me/messages",
      {
        recipient: { id: recipientId },
        message: message,
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN },
      }
    );
  } catch (err) {
    console.error("Facebook Send Error:", err.message);
  }
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("GPT-4o Bot Server running on port", PORT);
});
