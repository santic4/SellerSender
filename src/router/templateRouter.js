import express from "express";
import { createTemplate, getTemplates } from "../controllers/templateController.js";

const templateRouter = express.Router();

templateRouter.get("/", getTemplates);
templateRouter.post("/", createTemplate);


export default templateRouter;