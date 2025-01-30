import express from "express";
import { testController } from "../controllers/testController.js";

const testRouter = express.Router();

testRouter.get("/", testController);

export default testRouter;