export const getProductsController = async (req, res) => {
  const { accessToken } = req.cookies; 
  console.log(accessToken,'llegue a get controller')
  if (!accessToken) {
    return res.status(401).json({ error: "No estás autenticado" });
  }
  console.log('pase la verificación')
  try {
    const response = await fetch("https://api.mercadolibre.com/users/me/items/search", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response,'response')
    if (!response.ok) {
      return res.status(response.status);
    }

    const data = await response.json();

    console.log(data,'data en get controller')
    res.json(data.results);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}