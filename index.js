// index.js const express = require("express"); const bodyParser = require("body-parser"); const axios = require("axios"); const app = express(); const PORT = process.env.PORT || 3000;

// Replace with your actual GROQ API key const GROQ_API_KEY = "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"; const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"; const GROQ_MODEL = "mixtral-8x7b-32768"; // You can also try "llama3-70b-8192"

app.use(bodyParser.json());

const commandList = ╭───────────────⊷ ┋ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ ᴠ1 ╰───────────────⊷ ┃ .menu ┃ .autostatus ┃ .react ┃ .sticker ┃ .ping ┃ .hi ┃ .alive ┃ .uptime ┃ .quote ┃ .chatbot ┃ .joke ┃ .tts ┃ .screenshot ┃ .news ┃ .weather ┃ .translate ┃ .gif ┃ .meme ┃ .youtube ┃ .help ┃ .about ╰───────────────⊷ powered by rodgers;

app.post("/webhook", async (req, res) => { const message = req.body.message?.text?.toLowerCase() || ""; const sender = req.body.sender?.id || "unknown";

if (message === ".menu") { return res.json({ reply: commandList }); }

if (message.includes("what is your name")) { return res.json({ reply: "Am Toxic lover made by Rodgers" }); }

try { const aiRes = await axios.post( GROQ_API_URL, { model: GROQ_MODEL, messages: [ { role: "system", content: "You are Toxic Lover, a helpful, flirty, and charming AI created by Rodgers." }, { role: "user", content: message } ] }, { headers: { Authorization: Bearer ${GROQ_API_KEY}, "Content-Type": "application/json" } } );

const reply = aiRes.data.choices[0].message.content.trim();
return res.json({ reply });

} catch (error) { console.error("AI ERROR:", error.response?.data || error.message); return res.json({ reply: "Am sorry, AI is not responding." }); } });

app.get("/", (req, res) => { res.send("Toxic Lover AI is live!"); });

app.listen(PORT, () => { console.log(Server is running on port ${PORT}); });

  
