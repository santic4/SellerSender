import express from "express";
import { getProductsController, test } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:productId/assign-templates', );

export default productsRouter;