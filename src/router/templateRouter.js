import express from "express";
import { assignSecondMessages, createTemplate, getTemplates, updateTemplate, deleteTemplate } from "../controllers/templateController.js";
import { upload } from "../middlewares/multer.js";

const templateRouter = express.Router();

const handleUpload = upload.fields([
  { name: 'images-posventa', maxCount: 20 }
]);

templateRouter.post('/:productId/assign-second-messages',
  assignSecondMessages
);

templateRouter.post("/", 
    handleUpload,
    createTemplate);
    
templateRouter.get("/", getTemplates);

templateRouter.delete('/:id', deleteTemplate);

templateRouter.put("/:id", 
  handleUpload,
  updateTemplate);

export default templateRouter;