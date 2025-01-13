import { Template } from "../models/Template.js";
import { Product } from "../models/Product.js";
import { productServices } from "../services/productsServices.js";
import { userServices } from "../services/usersServices.js";

export const getProductsController = async (req, res, next) => {
  const { accessToken } = req.cookies; 
  console.log('antes accessToken')
  if (!accessToken) {
    return res.status(401).json({ error: "No estás autenticado" });
  }
  console.log('despuest access')
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

    console.log('enter al asign complete ')
    const templates = await Template.find({ '_id': { $in: templateIds } });
    if (templates.length !== templateIds.length) {
      return res.status(400).json({ message: "Algunas plantillas no son válidas." });
    }

    // Asignar las plantillas al producto
    const product = await Product.findByIdAndUpdate(
      id,
      { $addToSet: { templates: { $each: templateIds } } }, 
      { new: true }
    );

    res.json(product);
  } catch (error) {
    next()
  }
}