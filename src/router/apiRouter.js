import express from "express";
import authRouter from './authRouter.js'
import messagesRouter from './messagesRouter.js'
import templateRouter from './templateRouter.js'
import paymentsRouter from './paymentsRouter.js'
import productsRouter from "./productsRouter.js";

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use('/templates', templateRouter);
apiRouter.use('/payments', paymentsRouter);

export default apiRouter;