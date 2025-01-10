import express from "express";
import { getMessages, replyMessage } from "../controllers/messageController.js";

const messagesRouter = express.Router();

messagesRouter.get("/", getMessages);
messagesRouter.post("/:messageId/reply", replyMessage);

export default messagesRouter;