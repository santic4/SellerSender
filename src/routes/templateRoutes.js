import express from "express";
import { createTemplate, getTemplates } from "../controllers/templateController.js";

const router = express.Router();

router.post("/", createTemplate);
router.get("/", getTemplates);

export default router;