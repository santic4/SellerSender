import { Template } from "../models/Template.js";
import { Product } from "../models/Product.js";
import { productServices } from "../services/productsServices.js";
import { userServices } from "../services/usersServices.js";

export const getProductsController = async (req, res, next) => {
  const { accessToken } = req.cookies; 

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

  try {

    console.log(templateIds,'template,ids')
    const templates = await Template.find({ '_id': { $in: templateIds } });

    if (templates.length !== templateIds.length) {
      return res.status(400).json({ message: "Algunas plantillas no son válidas." });
    }

    const templateObjects = templates.map(template => ({
      templateId: template._id,
      name: template.name,
    }));

    let product = await Product.findOne({ productId: id });


    if (!product) {
      console.log('el producto no existe')
      product = new Product({
        productId: id,
        templates: templateObjects,
      });
      console.log(product, 'el producto creado')
    } else {
      console.log(product, 'el producto existe')
      // Si el producto existe, combinar las plantillas existentes con las nuevas
      const existingTemplates = product.templates.map(t => t.templateId.toString());
      const newTemplates = templateObjects.filter(t => !existingTemplates.includes(t.templateId.toString()));

      product.templates = [...product.templates, ...newTemplates];
    }

    console.log(product, 'antes del save')
    await product.save();

    res.status(200).json(product);

    res.json(product);
  } catch (error) {
    next()
  }
}