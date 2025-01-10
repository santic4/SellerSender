import express from "express";
import { getAuthUrl} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/auth", getAuthUrl);

export default authRouter;