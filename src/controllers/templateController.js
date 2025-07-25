import { Product } from '../models/Product.js';
import { Template } from '../models/Template.js';
import { templatesServices } from '../services/templatesServices.js';

export const createTemplate = async (req, res, next) => {
  const { name, content, assignedPublications } = req.body;
  const { files } = req;

  try {
    let filterContent = content;
    // normalizo saltos de línea
    const normalized = filterContent.replace(/\r\n/g, '\n');

    // si además querés validar longitud máxima:
    if (normalized.length > 350) {
      return res
        .status(400)
        .json({ error: 'El contenido supera el límite de 350 caracteres.' });
    }

    // y si quieres guardar el contenido normalizado en la DB:
    filterContent = normalized;

    let newImageUrls = [];

    if (files) {
      newImageUrls = await templatesServices.imageUploadFBService(files);
    }

    const template = new Template({ name, content: filterContent, assignedPublications, attachments: newImageUrls });

    await template.save();

    res.status(201).json(template);
  } catch (error) {
    next(error)
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await templatesServices.getTemplatesServices();

    res.json(templates);
  } catch (error) {
    next(error)
  }
};

export const assignSecondMessages = async (req, res, next) => {
  const { productId } = req.params;
  const { templateIds } = req.body;
  
  try {
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let secondArray = [];

    if (Array.isArray(templateIds) && templateIds.length > 0) {
      // 1) Buscamos todos los Template cuyo _id esté en templateIds
      const templatesDocs = await Template.find({ 
        _id: { $in: templateIds } 
      }).select('name'); // solo traemos el campo name (y _id)

      // 2) Creamos un mapa { id: TemplateDoc } para mantener orden
      const templateMap = {};
      templatesDocs.forEach(t => {
        templateMap[t._id.toString()] = t;
      });

      // 3) Recorremos templateIds en el mismo orden que vienen en el body
      secondArray = templateIds.map(id => {
        const tDoc = templateMap[id];
        return {
          templateId: id,
          name: tDoc ? tDoc.name : '' // si no se encuentra, queda vacío
        };
      });
    }

    product.secondMessages = secondArray;

    // 4) Guardamos cambios
    const updated = await product.save();

    // 5) Respondemos con el producto actualizado
    return res.status(200).json(updated);
    
  } catch (error) {
    next(error)
  }
};

export const updateTemplate = async (req, res, next) => {
  const { id } = req.params;
  const { files } = req;
  const { name, content, assignedPublications, attachmentsRaw } = req.body;

  try {

    // 1) Traer la plantilla existente
    const template = await templatesServices.getTemplateByID(id);

    // 3) Identificar y eliminar imágenes que fueron eliminadas en el front
    const oldAttachments = template.attachments || [];
    const toDelete = oldAttachments.filter(url => attachmentsRaw.includes(url));
   console.log(attachmentsRaw,'attachmentsRawDDD')
    let remainingAttachments

    if (toDelete.length > 0) {
      const ImagesDeleted = await templatesServices.imageDeleteFBService(toDelete);
      
      remainingAttachments = oldAttachments.filter(url => !toDelete.includes(url));
   
      console.log(ImagesDeleted,'IMAGESDELETEDDD')
    }else{
      remainingAttachments = oldAttachments;
      console.log(remainingAttachments,'remainingAttachmentsDENTRODEELSE')
    }
      console.log(remainingAttachments,'remainingAttachmentsDDD')
    // 4) Subir imágenes nuevas (si llegan en files)
    let newImageUrls = [];
    if (files) {
      console.log(files,'filesDDD')
      newImageUrls = await templatesServices.imageUploadFBService(files);
    }
console.log(newImageUrls,'newImageUrlsDDD2')
    const finalAttachments = [...remainingAttachments, ...newImageUrls];
console.log(finalAttachments,'finalAttachmentsDDD')
    // Normalizo content 
    let filterContent = content;
    // normalizo saltos de línea
    const normalized = filterContent.replace(/\r\n/g, '\n');

    // si además querés validar longitud máxima:
    if (normalized.length > 350) {
      return res
        .status(400)
        .json({ error: 'El contenido supera el límite de 350 caracteres.' });
    }

    // y si quieres guardar el contenido normalizado en la DB:
    filterContent = normalized;

    // 5) Actualizar campos de la plantilla
    template.name                 = name;
    template.content              = filterContent;
    template.assignedPublications = Array.isArray(assignedPublications)
                                     ? assignedPublications
                                     : [];
    template.attachments          = finalAttachments;

    // 6) Guardar y devolver
    const updatedTemplate = await template.save();

    res.status(200).json(updatedTemplate);

  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  const { id } = req.params;

  try {
    const template = await Template.findById(id);

    if(!template) throw new Error('Plantilla no encontrada');

    const templateImagesToDelete = template?.attachments;

    await templatesServices.imageDeleteFBService(templateImagesToDelete);

    await Template.findByIdAndDelete(id);

    res.status(200).json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la plantilla:', error);
    next()
  }
};