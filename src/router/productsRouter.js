import express from "express";
import { getProductsController } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);

productsRouter.post('/api/products/:productId/assign-templates', );

export default productsRouter;