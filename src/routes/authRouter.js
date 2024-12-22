import express from "express";
import { getAuthUrl, callback } from "../controllers/authController.js";

const router = express.Router();

router.get("/auth-url", getAuthUrl);
router.get("/callback", callback);

export default router;