import { Template } from "../models/Template.js";
import { Product } from "../models/Product.js";
import { productServices } from "../services/productsServices.js";
import { userServices } from "../services/usersServices.js";
import { getValidAccessToken } from "./paymentsController.js";

export const getProductsController = async (req, res, next) => {

  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return res.status(401).json({ error: "No estás autenticado" });
  }


  try {
    const userID = await userServices.getInfoUserServices(accessToken);

    const productsData = await productServices.getProductsServices(accessToken, userID)

    const detailsProducts = await productServices.getDetailsProduct(accessToken, productsData);

    res.status(200).json(detailsProducts);
  } catch (error) {
    next()
  }
}

export const asignTemplate = async (req, res, next) => {
  const { id } = req.params;
  const { templateIds } = req.body;
  const { productAsign } = req.body;

  try {

    const templates = await Template.find({ '_id': { $in: templateIds } });
  
    console.log(templates,'templates en coso')
    if (templates.length !== templateIds.length) {
      return res.status(400).json({ message: "Algunas plantillas no son válidas." });
    }

    const templateUpdateMany = await Template.updateMany(
      { _id: { $in: templateIds } },
      { $addToSet: { assignedPublications: productAsign } }
    );

    console.log(templateUpdateMany,'templateUpdateMany')

    const templateObjects = templates.map(template => ({
      templateId: template._id,
      name: template.name,
    }));

    let product = await Product.findOne({ id: id });

    if (!product) {

      product = new Product({
        id: id,
        templates: templateObjects,
        title: productAsign
      });
    } else {
      const existingTemplates = product.templates.map(t => t.templateId.toString());
      const newTemplates = templateObjects.filter(t => !existingTemplates.includes(t.templateId.toString()));

      product.templates = [...product.templates, ...newTemplates];
    }

    await product.save();

    res.status(200).json(product);

    res.json(product);
  } catch (error) {
    next()
  }
}

export const getSavedProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("templates.templateId");

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  const { productId, templateId } = req.params;

  try {
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    product.templates = product.templates.filter((template) => template.templateId.toString() !== templateId);

    await product.save();

    res.status(200).json({ message: "Plantilla eliminada correctamente." });
  } catch (error) {
    next(error);
  }
};

export const deleteProductAsign = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOneAndDelete({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    res.status(200).json({ message: "Producto eliminado correctamente." });
  } catch (error) {
    next(error);
  }
};

export const addTemplateToProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { templateIds } = req.body; // Ahora recibimos un array de IDs

  try {
    // Validamos que se envíe un array
    if (!Array.isArray(templateIds)) {
      return res.status(400).json({ message: "El campo templateIds debe ser un arreglo." });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const addedTemplates = [];
    const skippedTemplates = [];

    // Iteramos sobre cada templateId recibido
    for (const tid of templateIds) {
      const template = await Template.findById(tid);
      if (!template) {
        skippedTemplates.push({ templateId: tid, reason: "Plantilla no encontrada." });
        continue;
      }

      // Verificamos si la plantilla ya está asignada
      const existingTemplate = product.templates.find(
        (t) => t.templateId.toString() === tid.toString()
      );
      if (existingTemplate) {
        skippedTemplates.push({ templateId: tid, reason: "La plantilla ya está asignada." });
        continue;
      }

      // Agregamos la plantilla al producto
      product.templates.push({ templateId: template._id, name: template.name });
      addedTemplates.push({ templateId: template._id, name: template.name });
    }

    await product.save();

    res.status(200).json({
      message: "Plantilla(s) añadida(s) correctamente.",
      addedTemplates,
      skippedTemplates,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderTemplateInProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { templateId, direction } = req.body; 

  try {
    // Buscamos el producto según su id (ajusta según tu modelo)
    const product = await Product.findOne({ id: productId });
    console.log(product,'producto encontrado')
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }


    const id_template = templateId._id;

    console.log(id_template,'id_template')
    console.log(product.templates,'product.templates')

    // Encontrar el índice de la plantilla en el array
    const index = product.templates.findIndex(
      (t) => t.templateId.toString() === id_template.toString()
    );

    if (index === -1) {
      return res.status(404).json({ message: "Plantilla no asignada." });
    }

    // Determinar el nuevo índice basado en la dirección
    let newIndex;
    if (direction === "up") {
      newIndex = index - 1;
    } else if (direction === "down") {
      newIndex = index + 1;
    } else {
      return res.status(400).json({ message: "Dirección no válida." });
    }

    // Verificar límites del array
    if (newIndex < 0 || newIndex >= product.templates.length) {
      return res.status(400).json({ message: "No se puede mover en esa dirección." });
    }

    // Intercambiar la plantilla actual con la plantilla en la nueva posición
    const temp = product.templates[index];
    product.templates[index] = product.templates[newIndex];
    product.templates[newIndex] = temp;

    await product.save();

    res.status(200).json({
      message: "Orden actualizado correctamente.",
      templates: product.templates,
    });
  } catch (error) {
    next(error);
  }
};