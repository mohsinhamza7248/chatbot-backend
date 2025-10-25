import express from "express";
import { getAllSessions, getChatHistory, sendMessage } from "../controller/chatController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/history/:sessionId", getChatHistory);
router.get("/sessions", getAllSessions);


export default router;
