import express from "express";
import { addTemplateToProduct, asignTemplate, deleteTemplate, getProductsController, getSavedProducts, } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:id/assign-templates', asignTemplate);
productsRouter.get("/saved", getSavedProducts);
productsRouter.delete("/:productId/templates/:templateId", deleteTemplate);
productsRouter.post("/:productId/assign-template", addTemplateToProduct);

export default productsRouter;