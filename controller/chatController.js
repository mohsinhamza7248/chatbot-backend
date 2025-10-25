import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import Chat from "../models/chatModel.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve('./.env') });

export const sendMessage = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key Not Configured" });
  }

  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;


    const chatEntry = await Chat.create({
      sessionId: sessionId || uuidv4(),
      messages: [
        { role: "user", content: message },
        { role: "ai", content: aiResponse },
      ],
    });

    res.status(200).json({
      response: aiResponse,
      sessionId: chatEntry.sessionId,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch AI response",
      details: error.response?.data || error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await Chat.findOne({ sessionId });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const chats = await Chat.find({}, "sessionId title createdAt")
    const sessions = chats.map(c => ({
      sessionId: c.sessionId,
      title: c.title || "Untitled Chat",
    }))
    res.status(200).json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
