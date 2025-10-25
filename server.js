
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve('./.env') });
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import chatRoutes from "./Routes/chatRoutes.js";

connectDB();


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));