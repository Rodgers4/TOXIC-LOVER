// Toxic Lover Facebook Bot with GROQ AI integration

const express = require("express"); const bodyParser = require("body-parser"); const axios = require("axios"); require("dotenv").config();

const app = express(); app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rodgers4"; const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Verification Endpoint app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) { res.status(200).send(challenge); } else { res.sendStatus(403); } });

// Message Webhook app.post("/webhook", async (req, res) => { const body = req.body;

if (body.object === "page") { for (const entry of body.entry) { const webhookEvent = entry.messaging[0]; const senderId = webhookEvent.sender.id; const message = webhookEvent.message?.text;

if (message) {
    const lower = message.toLowerCase();

    // Handle menu
    if (lower === ".menu") {
      const menu = `╭─────❰ Toxic Lover ❱─────

│ │ 📜 Available Commands: │ │ 1. .lyrics (song name) │ 2. .waifu │ 3. .joke │ 4. .quote │ 5. .animequote │ 6. .advice │ 7. .fact │ 8. .weather (city) │ 9. .time (city) │10. .translate (lang) (text) │11. .math (expression) │12. .bitcoin │13. .news │14. .github (user) │15. .instagram (user) │16. .tiktok (user) │17. .shorten (url) │18. .define (word) │19. .qr (text) │20. .cat │21. .dog │22. .meme │23. .nasa │24. .bored │25. .riddle │26. .quoteoftheday │27. .pickup │28. .activity │29. .yesorno │30. .8ball │ ╰─────────── 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒`;

await sendText(senderId, menu);
    }

    // Custom AI identity
    else if (
      lower.includes("what is your name") ||
      lower.includes("who is your owner")
    ) {
      await sendText(
        senderId,
        `I am Toxic the Roy's finest.\nMy owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒.`
      );
    } else {
      // GROQ AI Answer
      const aiResponse = await fetchGroqReply(message);

      await sendText(senderId, aiResponse);
      await sendText(senderId, "Type .menu to see available commands");
    }
  }
}
res.sendStatus(200);

} else { res.sendStatus(404); } });

async function fetchGroqReply(userInput) { try { const response = await axios.post( "https://api.groq.com/openai/v1/chat/completions", { model: "llama3-8b-8192", messages: [ { role: "system", content: "You are Toxic, a smart Facebook Messenger AI made by SIR RODGERS. Always respond in Kiswahili if the user types in Kiswahili. Keep answers short and helpful." }, { role: "user", content: userInput } ] }, { headers: { Authorization: Bearer ${GROQ_API_KEY}, "Content-Type": "application/json" } } );

return response.data.choices[0].message.content;

} catch (err) { console.error("GROQ error:", err); return "Samahani, kuna hitilafu. Tafadhali jaribu tena."; } }

async function sendText(senderId, text) { try { await axios.post( https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}, { recipient: { id: senderId }, message: { text } } ); } catch (error) { console.error("Send message error:", error.response?.data || error.message); } }

app.get("/", (req, res) => { res.send("Toxic Lover Facebook Bot Running..."); });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(Server live on port ${PORT}));

