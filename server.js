const express = require("express"); const axios = require("axios"); const bodyParser = require("body-parser"); const app = express();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD"; const VERIFY_TOKEN = "rodgers4"; const WELCOME_SENT = new Set();

app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("Webhook verified"); res.status(200).send(challenge); } else { res.sendStatus(403); } });

app.post("/webhook", async (req, res) => { const body = req.body;

if (body.object === "page") { for (const entry of body.entry) { const webhookEvent = entry.messaging[0]; const senderId = webhookEvent.sender.id;

if (!WELCOME_SENT.has(senderId)) {
    await sendText(senderId, "Hello, type Gpt4o before every text you send to get replies");
    await sendText(
      senderId,
      "📌 Available Commands:\n- Gpt4o <your question>\n- .help\n- .about\n- .bot"
    );
    WELCOME_SENT.add(senderId);
  }

  if (webhookEvent.message && webhookEvent.message.text) {
    const msg = webhookEvent.message.text;

    if (msg.toLowerCase().startsWith("gpt4o")) {
      const query = msg.replace(/gpt4o\s*/i, "");

      try {
        const resAI = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(query)}`);
        const reply = resAI.data.reply || resAI.data || "Sorry, I couldn't get a reply.";
        await sendText(senderId, reply);
      } catch (err) {
        await sendText(senderId, "❌ GPT-4o API error. Please try again later.");
      }
    }
  }
}
res.status(200).send("EVENT_RECEIVED");

} else { res.sendStatus(404); } });

function sendText(senderId, text) { return axios.post( https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}, { recipient: { id: senderId }, message: { text }, } ); }

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(✅ Server running on port ${PORT}));

    
