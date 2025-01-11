import express from "express";
import { callback, checkAuth, getAuthUrl} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get('/url', getAuthUrl);

authRouter.get('/callback', callback);

authRouter.get('/check', checkAuth);

export default authRouter;