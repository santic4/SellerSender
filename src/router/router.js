import express from "express";
import authRouter from './authRouter.js'
import messagesRouter from './messagesRouter.js'
import templateRouter from './templateRouter.js'
import paymentsRouter from './paymentsRouter.js'

const router = express.Router();

router.use('/api', authRouter);
router.use("/api", messagesRouter);
router.use('/api', templateRouter);
router.use('/api', paymentsRouter);

export default router;