import express from "express";
import { asignTemplate, getProductsController, } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:id/assign-templates', asignTemplate);

export default productsRouter;