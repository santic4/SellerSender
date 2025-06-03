import express from "express";
import { addTemplateToProduct, getProductById, asignTemplate, deleteProductAsign, delayAsign, deleteTemplate, deleteSecondTemplate, getProductsController, getSavedProducts, getTemplatesByProduct, reorderTemplateInProduct } from "../controllers/productsController.js";

const productsRouter = express.Router();

productsRouter.get('/', getProductsController);
productsRouter.post('/:id/assign-templates-modal', asignTemplate);
productsRouter.post('/:productId/assign-delay', delayAsign);
productsRouter.get("/saved", getSavedProducts);
productsRouter.get("/template/:productId", getTemplatesByProduct);
productsRouter.delete("/:productId/templates/:templateId", deleteTemplate);
productsRouter.delete("/:productId/second-template/:templateId", deleteSecondTemplate);
productsRouter.post("/:productId/assign-template", addTemplateToProduct);
productsRouter.patch("/:productId/templates/reorder", reorderTemplateInProduct);
productsRouter.delete("/:productId/saved-product", deleteProductAsign);
productsRouter.get("/:productId/refetch-id", getProductById);
export default productsRouter;