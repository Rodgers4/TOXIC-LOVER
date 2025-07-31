// server.js const express = require("express"); const axios = require("axios"); const bodyParser = require("body-parser");

const app = express(); app.use(bodyParser.json());

const VERIFY_TOKEN = "rodgers4"; const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";

// Verification endpoint app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];

if (mode && token) { if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("WEBHOOK_VERIFIED"); res.status(200).send(challenge); } else { res.sendStatus(403); } } });

// Message handling app.post("/webhook", async (req, res) => { const body = req.body; if (body.object === "page") { body.entry.forEach(async (entry) => { const webhook_event = entry.messaging[0]; const sender_psid = webhook_event.sender.id; if (webhook_event.message && webhook_event.message.text) { const messageText = webhook_event.message.text; try { const response = await axios.get( https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(messageText)} ); const replyText = ╔═══════════════╗\n     𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑\n╚═══════════════╝\n\n${response.data.answer || "Sorry, I didn't understand that."};

await callSendAPI(sender_psid, replyText);
    } catch (error) {
      console.error("Error with Kaiz API:", error.message);
      await callSendAPI(sender_psid, "Something went wrong with the AI 😢");
    }
  }
});
res.status(200).send("EVENT_RECEIVED");

} else { res.sendStatus(404); } });

function callSendAPI(sender_psid, response) { return axios({ method: "POST", url: "https://graph.facebook.com/v18.0/me/messages", params: { access_token: PAGE_ACCESS_TOKEN }, data: { recipient: { id: sender_psid }, message: { text: response }, }, }); }

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(Server running on port ${PORT}));

