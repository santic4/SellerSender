import express from "express";
import authRouter from './authRouter.js'
import messagesRouter from './messagesRouter.js'
import templateRouter from './templateRouter.js'
import paymentsRouter from './paymentsRouter.js'

const router = express.Router();

router.use('/auth', authRouter);
router.use("/messages", messagesRouter);
router.use('/templates', templateRouter);
router.use('/payments', paymentsRouter);

export default router;