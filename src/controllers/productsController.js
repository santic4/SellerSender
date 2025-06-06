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
  const { templateIds, productAsign, variationId, variationName } = req.body;

  try {
    const templates = await Template.find({ '_id': { $in: templateIds } });

    if (templates.length !== templateIds.length) {
      return res.status(400).json({ message: "Algunas plantillas no son válidas." });
    }

    await Template.updateMany(
      { _id: { $in: templateIds } },
      { $addToSet: { assignedPublications: productAsign } }
    );

    const templateObjects = templateIds.map(templateId => {
      const template = templates.find(t => t._id.toString() === templateId);
      return template ? { templateId: template._id, name: template.name } : null;
    }).filter(t => t !== null);

    let product = await Product.findOne({ id: id });

    if (!product) {
      // Si el producto no existe, se crea uno nuevo.
      if (variationId) {
        product = new Product({
          id: id,
          title: productAsign,
          templates: [],
          variations: [{ id: variationId, name: variationName, templates: templateObjects }],
        });
      } else {
        product = new Product({
          id: id,
          title: productAsign,
          templates: templateObjects,
        });
      }
    } else {
      // El producto existe, se actualiza según corresponda.
      if (variationId) {
        // Actualizamos la variante específica.
        let variation = product.variations.find(v => v.id === variationId);
        if (variation) {
          variation.templates = templateObjects;
          variation.name = variationName;
        } else {
          // Si la variante no existe, se agrega al arreglo.
          product.variations.push({ id: variationId, name: variationName, templates: templateObjects });
        }
      } else {
        // Si no se envía variationId, se asignan las plantillas a nivel global.
        product.templates = templateObjects;
      }
    }

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    next();
  }
};

export const getSavedProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("templates.templateId")
      .populate("secondMessages.templateId")
      .populate("secondMessages.name")

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getTemplatesByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Devolvemos tanto las plantillas globales como las variantes con sus plantillas asignadas.
    res.json({
      templates: product.templates || [],
      variations: product.variations || [],
    });
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

export const deleteSecondTemplate = async (req, res, next) => {
  const { productId, templateId } = req.params;

  try {
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    product.secondMessages = product.secondMessages.filter((template) => template.templateId.toString() !== templateId);


    await product.save();

    res.status(200).json({ message: "Segunda plantilla eliminada correctamente." });
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

export const delayAsign = async (req, res, next) => {
  const { productId } = req.params;
  const { delayHours } = req.body;

  try {
    // Validaciones básicas
    if (typeof delayHours !== 'number' || delayHours < 1 || delayHours > 72) {
      return res.status(400).json({
        error: 'delayHours debe ser un número entre 1 y 72'
      });
    }

    // Buscamos el producto por su campo “id” (no el _id de Mongo)
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Asignamos el nuevo valor
    product.secondMessageDelay = delayHours;

    // Guardamos
    await product.save();

    return res.status(200).json({
      message: 'secondMessageDelay actualizado',
      secondMessageDelay: product.secondMessageDelay
    });
  } catch (error) {
    next(error);
  }
};


export const getProductById = async (req, res, next) => {
  const { productId } = req.params;

  try {
    // Busca el producto por su id:
    const producto = await Product.findOne({id: productId}).lean();
    console.log(producto,' PRRRRR')
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    return res.json(producto);
  } catch (err) {
    console.error("Error en getProductById:", err);
    next()
  }
};