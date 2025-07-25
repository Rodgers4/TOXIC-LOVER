const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN";
const VERIFY_TOKEN = "rodgers4";
const GROQ_API_KEY = "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";

app.get("/", (req, res) => {
  res.send("TOXIC LOVER is Live 😎");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
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
        const sender = event.sender.id;
        if (event.message && event.message.text) {
          const msg = event.message.text.toLowerCase();

          if (msg === ".menu") {
            return sendMenu(sender);
          }

          if (msg.includes("what is your name")) {
            return sendText(sender, "Am 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 a girl made to be authentic\n\nType .menu to see all cmds");
          }

          if (msg.includes("who is your owner")) {
            return sendText(sender, "My beloved/Intelligent/Cheeky owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒\n\nType .menu to see all cmds");
          }

          const groqReply = await askGroq(msg);
          return sendText(sender, `${groqReply}\n\nType .menu to see all cmds`);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function askGroq(userMsg) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("GROQ API ERROR:", err.message);
    return "Something went wrong with AI 😢";
  }
}

async function sendText(sender, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender },
      message: { text: message }
    }
  );
}

async function sendMenu(sender) {
  const menu = `
╔═════════❖
║ 🖥️ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 𝐁𝐎𝐓  
║━━━━━━━━━━━━━━━━
║ ✦ GROUP A — CHAT
║ ⌲ .ai
║ ⌲ .ask
║ ⌲ .define
║ ⌲ .search
║ ⌲ .quote
║━━━━━━━━━━━━━━━━
║ ✦ GROUP B — MEDIA
║ ⌲ .ytmp3
║ ⌲ .ytmp4
║ ⌲ .tiktok
║ ⌲ .insta
║ ⌲ .fbdown
║━━━━━━━━━━━━━━━━
║ ✦ GROUP C — FUN
║ ⌲ .joke
║ ⌲ .meme
║ ⌲ .roast
║ ⌲ .truth
║ ⌲ .dare
║━━━━━━━━━━━━━━━━
║ ✦ GROUP D — TOOLS
║ ⌲ .weather
║ ⌲ .translate
║ ⌲ .reminder
║ ⌲ .shorturl
║ ⌲ .qrcode
╚═════════❖

𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐎𝐃𝐆𝐄𝐑𝐒
`;
  await sendText(sender, menu);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server ready on PORT " + PORT));
