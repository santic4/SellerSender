import express from "express";
import { getMessages, replyMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/", getMessages);
router.post("/:messageId/reply", replyMessage);

export default router;