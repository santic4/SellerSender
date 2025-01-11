import { productServices } from "../services/productsServices.js";
import { userServices } from "../services/usersServices.js";

export const getProductsController = async (req, res) => {
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
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}