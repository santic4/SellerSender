import express from "express";
import { addTemplateToProduct, asignTemplate, deleteProductAsign, deleteTemplate, getProductsController, getSavedProducts, getTemplatesByProduct, reorderTemplateInProduct, } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:id/assign-templates-modal', asignTemplate);
productsRouter.get("/saved", getSavedProducts);
productsRouter.get("/template/:productId", getTemplatesByProduct);
productsRouter.delete("/:productId/templates/:templateId", deleteTemplate);
productsRouter.post("/:productId/assign-template", addTemplateToProduct);
productsRouter.patch("/:productId/templates/reorder", reorderTemplateInProduct);
productsRouter.delete("/:productId/saved-product", deleteProductAsign);

export default productsRouter;