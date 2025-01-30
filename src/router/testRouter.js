import express from "express";
import { testController, createExpiredToken } from "../controllers/testController.js";

const testRouter = express.Router();

testRouter.get("/", testController);
testRouter.post("/", createExpiredToken);
export default testRouter;