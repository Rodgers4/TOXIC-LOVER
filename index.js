const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Your tokens
const VERIFY_TOKEN = "rodgers4";
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPFRyZAYWtZCppUrjygNmuBwglLZBhgNTtVtdkeAh0hmc0bqiQbv2kGyhSJvfpGXeWpZArydfcFy3lDOBId7VZCWkwSIMOPhilSWaJJ8JjJbETKZBjX1tVUoope98ZAhZBCSHsxsZC638DTgi2uAt6ImPS40g1Henc9jwVyvMTzPIkBK1SwgX9ljl2ChU95EZAtUAZDZD";
const GROQ_API_KEY = "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";

// Messenger Webhook Verification
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
    const body = req.body;
    if (body.object === "page") {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const userMessage = webhook_event.message.text.trim().toLowerCase();

                // Handle custom responses
                if (userMessage === ".menu") {
                    const menuText = `
╭──────────────⊷
┃   TOXIC LOVER COMMANDS
┃
┃ .menu  - View this list
┃ .help  - Show help
┃ .about - About bot
┃ .chatbot - Enable AI
┃ .status - Bot status
┃ .react - Auto react
┃ .owner - Show owner
┃ .funny - Send a joke
┃ .info - User info
┃ .hi - Greeting
┃ .bye - Goodbye
┃ .time - Time now
┃ .date - Today date
┃ .fact - Random fact
┃ .emoji - Send emoji
┃ .sticker - Send sticker
┃ .quote - Life quote
┃ .bot - Bot info
┃ .group - Group info
┃ .link - My links
┃
┃ POWERED BY RODGERS
╰──────────────⊷
`;
                    await sendMessage(sender_psid, menuText);
                } else if (userMessage.includes("what is your name")) {
                    await sendMessage(sender_psid, "Am Toxic lover made by Rodgers.");
                } else {
                    const aiReply = await askGroq(userMessage);
                    await sendMessage(sender_psid, aiReply);
                }
            }
        });
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// Send Message to Facebook
async function sendMessage(sender_psid, response) {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: sender_psid },
        message: { text: response }
    });
}

// Ask Groq AI (LLaMA3)
async function askGroq(question) {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are Toxic Lover, a friendly assistant made by Rodgers. Respond in a helpful and interactive way.",
                    },
                    {
                        role: "user",
                        content: question,
                    },
                ],
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error("Groq Error:", err.response?.data || err.message);
        return "Sorry, AI is not responding at the moment. Try again later.";
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Toxic Lover bot is live at http://localhost:${PORT}`);
});
