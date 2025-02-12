import express from "express";
import { addTemplateToProduct, asignTemplate, deleteTemplate, getProductsController, getSavedProducts, reorderTemplateInProduct, } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:id/assign-templates-modal', asignTemplate);
productsRouter.get("/saved", getSavedProducts);
productsRouter.delete("/:productId/templates/:templateId", deleteTemplate);
productsRouter.post("/:productId/assign-template", addTemplateToProduct);
productsRouter.patch("/:productId/templates/reorder", reorderTemplateInProduct);


export default productsRouter;