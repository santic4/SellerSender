import express from "express";
import { webhookPayment } from "../controllers/paymentsController.js";

const router = express.Router();

router.post("/", webhookPayment);

export default router;