import express from "express";
import { createTemplate, getTemplates, updateTemplate } from "../controllers/templateController.js";

const templateRouter = express.Router();

templateRouter.get("/", getTemplates);
templateRouter.post("/", createTemplate);
templateRouter.put("/:id", updateTemplate);

export default templateRouter;