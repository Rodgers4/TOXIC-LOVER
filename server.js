// server.js import express from "express"; import bodyParser from "body-parser"; import axios from "axios";

const app = express(); app.use(bodyParser.json());

const VERIFY_TOKEN = "rodgers4"; const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";

let sentWelcome = {};

app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];

if (mode && token) { if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("Webhook verified"); res.status(200).send(challenge); } else { res.sendStatus(403); } } });

app.post("/webhook", async (req, res) => { const body = req.body;

if (body.object === "page") { for (const entry of body.entry) { const webhook_event = entry.messaging[0]; const sender_psid = webhook_event.sender.id;

if (!sentWelcome[sender_psid]) {
    await sendTextMessage(
      sender_psid,
      "Hello, type Gpt4o before every text you send to get replies"
    );
    sentWelcome[sender_psid] = true;
  }

  if (webhook_event.message && webhook_event.message.text) {
    const message = webhook_event.message.text;

    if (message.toLowerCase() === ".menu") {
      await sendTextMessage(sender_psid, `

╭───────────⊷ ┃ 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 - COMMAND LIST ╰───────────⊷

🧠 .deepseek - Chat with GPT-4o 🎮 More commands coming soon!

POWERED BY RODGERS `); return; }

if (message.toLowerCase().startsWith("gpt4o")) {
      const prompt = message.substring(5).trim();
      const reply = await queryGpt4o(prompt);
      await sendTextMessage(sender_psid, `💀 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 💀\n\n${reply}`);
    }
  }
}
res.status(200).send("EVENT_RECEIVED");

} else { res.sendStatus(404); } });

async function sendTextMessage(sender_psid, message) { try { await axios.post( https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}, { recipient: { id: sender_psid }, message: { text: message }, } ); } catch (err) { console.error("Error sending message:", err.response?.data || err); } }

async function queryGpt4o(prompt) { try { const res = await axios.get( https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(prompt)}, { headers: { apikey: "5f2fb551-c027-479e-88be-d90e5dd7d7e0" } } ); return res.data.answer || "No reply received."; } catch (err) { console.error("GPT-4o API error:", err.response?.data || err); return "Failed to get a reply from GPT-4o."; } }

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log("Server is running on port", PORT));

  
