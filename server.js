const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Toxic Lover Facebook Bot is live 💖");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.toLowerCase();

        // .menu command
        if (userMessage === ".menu") {
          await sendText(senderId, `
╭──🎀 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐌𝐄𝐍𝐔 🎀──╮
│ 👑 𝐆𝐄𝐍𝐄𝐑𝐀𝐋 𝐂𝐌𝐃𝐒
│ ━ .menu, .about, .owner, .ping
│
│ 💬 𝐂𝐇𝐀𝐓 & 𝐀𝐈
│ ━ .ask, .fact, .quote, .define
│
│ 🔧 𝐓𝐎𝐎𝐋𝐒
│ ━ .calc, .shorten, .weather
│
│ 🎮 𝐅𝐔𝐍
│ ━ .joke, .meme, .truth, .dare
│
│ 💕 𝐋𝐎𝐕𝐄 & 𝐅𝐄𝐄𝐋𝐒
│ ━ .pickup, .lovequote, .rate
│
│ 📚 𝐄𝐃𝐔𝐂𝐀𝐓𝐈𝐎𝐍
│ ━ .gpt, .translate, .meaning
│
│ 📸 𝐌𝐄𝐃𝐈𝐀
│ ━ .img, .ytmp3, .ytmp4
│
│ 🛡️ 𝐀𝐃𝐌𝐈𝐍
│ ━ .ban, .kick, .unban
╰──────────
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
          `.trim());
          return;
        }

        // Custom questions
        if (userMessage.includes("what is your name")) {
          await sendText(senderId, "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic\n\nType .menu to see available cmds");
          return;
        }

        if (userMessage.includes("who is your owner")) {
          await sendText(senderId, "My beloved/Intelligent/Cheeky owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒\n\nType .menu to see available cmds");
          return;
        }

        // Forward to kaiz API
        try {
          const response = await axios.get("https://kaiz-apis.gleeze.com/", {
            params: { message: userMessage },
          });

          const aiReply = response.data?.response || "I'm here but quiet...";

          await sendText(senderId, aiReply + "\n\nType .menu to see available cmds");
        } catch (err) {
          await sendText(senderId, "Oops! I ran into an error. Try again later.\n\nType .menu to see available cmds");
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Messenger webhook verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "rodgers4";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

async function sendText(senderId, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=YOUR_PAGE_ACCESS_TOKEN`,
    {
      recipient: { id: senderId },
      message: { text },
    }
  );
}

app.listen(PORT, () => {
  console.log(`Toxic Lover bot server running on port ${PORT}`);
});
