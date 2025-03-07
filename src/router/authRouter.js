import express from "express";
import { callback, checkAuth, getAuthUrl, logoutMeli } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get('/url', getAuthUrl);

authRouter.get('/check', checkAuth);

authRouter.post('/logout', logoutMeli);

authRouter.get('/callback', callback);

export default authRouter;