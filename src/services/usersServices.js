/**
 * Obtiene información del usuario logueado desde la API de Mercado Libre.
 * @param {string} accessToken Token de acceso válido.
 * @returns {Promise<object[]>} Información del usuario.
 */

class UserServices{
    async getInfoUserServices (accessToken) {

        try {
            const responseUser = await fetch("https://api.mercadolibre.com/users/me", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          
            if (!responseUser.ok) {
                const errorText = await responseUser.text();
                console.log("Error en la respuesta de Mercado Libre:", errorText);
                throw new Error('Error en la respuesta de Mercado Libre al obtener usuario.')
            }
          
            const dataUser = await responseUser.json();
    
          return dataUser.id;
        } catch (error) {
          console.error("Error al obtener información del usuario desde la API:", error.message);
          throw error;
        }
      };
}

export const userServices = new UserServices()

