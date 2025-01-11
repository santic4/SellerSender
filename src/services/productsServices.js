/**
 * Obtiene información del usuario logueado desde la API de Mercado Libre.
 * @param {string} accessToken Token de acceso válido.
 * @returns {Promise<object[]>} Información del usuario.
 */

class ProductServices{
    async getProductsServices(accessToken, userID){

      try {
          const responseProducts = await fetch(`https://api.mercadolibre.com/users/${userID}/items/search`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        
          if (!responseProducts.ok) {
              const errorText = await responseProducts.text();
              console.log("Error en la respuesta de Mercado Libre:", errorText);
              throw new Error('Error en la respuesta de Mercado Libre al obtener productos.')
          }
      
          const data = await responseProducts.json();
      
        return data;
      } catch (error) {
        console.error("Error al obtener productos desde la API:", error.message);
        throw error;
      }
    };

    async getDetailsProduct(accessToken, productsData){

        try {
            const productDetailsPromises = productsData.results.map(async (itemID) => {

              const responseItem = await fetch(`https://api.mercadolibre.com/items/${itemID}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
          
              if (!responseItem.ok) {
                const errorText = await responseItem.text();
                console.log("Error al obtener el producto:", errorText);
                throw new Error(`Error al obtener el producto con ID: ${itemID}`);
              }
          
              const productData = await responseItem.json();

              return productData; 
            });
          
            const productDetails = await Promise.all(productDetailsPromises);
                
            const productsSummary = productDetails.map(product => ({
              title: product.title,
              site_id: product.site_id
            }));
        
            return productsSummary; 
        } catch (error) {
          console.error("Error al obtener productos desde la API:", error.message);
          throw error;
        }
      };
}

export const productServices = new ProductServices()

