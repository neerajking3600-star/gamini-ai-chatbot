const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// File Upload Setup
const upload = multer({ dest: 'uploads/' });

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Chat Database Schema
const ChatSchema = new mongoose.Schema({
    userId: String,
    title: String,
    messages: Array,
    createdAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

// AI Chat Route (OpenRouter - Gemini 3.1 Pro)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-3.1-pro-preview-customtools",
            messages: messages,
            reasoning: { enabled: true }
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        res.json(response.data.choices[0].message);
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        res.status(500).json({ error: "AI Response Error" });
    }
});

// Save Chat Route
app.post('/api/save-chat', async (req, res) => {
    try {
        const { userId, title, messages } = req.body;
        const newChat = new Chat({ userId, title, messages });
        await newChat.save();
        res.json({ success: true, id: newChat._id });
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
