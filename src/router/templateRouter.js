import express from "express";
import { assignSecondMessages, createTemplate, getTemplates, updateTemplate } from "../controllers/templateController.js";
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



templateRouter.put("/:id", 
  handleUpload,
  updateTemplate);

export default templateRouter;