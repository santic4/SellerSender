import express from "express";
import { getProductsController } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);


export default productsRouter;