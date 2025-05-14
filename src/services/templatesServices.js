import { bucket } from "../config/firebase-config.js";
import { templatesDao } from "../DAO/templateDao.js";

class TemplatesServices{
    async getTemplatesServices(){

        const templates = await templatesDao.getTemplatesDAO();

        if (!templates) {
          throw new Error('Plantillas no encontradas.')
        }

        return templates;
    };

    async getTemplateByID(id){

        const template = await templatesDao.getTemplateByID(id);

        if (!template) {
          throw new Error('Plantilla no encontrada.')
        }

        return template;
    };

    async imageUploadFBService(files){

        console.log(files,' filesupload FB en services')
        const imageFiles = files['images-posventa'] || [];

        const imageUrls = [];

        // Subir imágenes a Firebase Storage
        for (const file of imageFiles) {
          const fileUpload = bucket.file(`seller-sender/${file.originalname}`);
          await fileUpload.save(file.buffer, { contentType: file.mimetype });
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
          imageUrls.push(imageUrl);
        }

        return imageUrls;
    };

    async imageDeleteFBService(toDelete){

        const deleted = await Promise.all(toDelete.map(async url => {
         const match = url.match(/\/o\/(.+)\?alt=media/);
         if (match?.[1]) {
           const filePath = decodeURIComponent(match[1]);
           try {
             await bucket.file(filePath).delete();
             console.log(`🗑️ Borrado de Firebase: ${filePath}`);
           } catch (e) {
             console.warn(`No se pudo borrar ${filePath}:`, e.message);
           }
         }
        }));
        
        return deleted;
    };


}

export const templatesServices = new TemplatesServices()

