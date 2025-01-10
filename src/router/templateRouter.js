import express from "express";
import { createTemplate, getTemplates } from "../controllers/templateController.js";

const templateRouter = express.Router();

templateRouter.post("/", createTemplate);
templateRouter.get("/", getTemplates);

export default templateRouter;