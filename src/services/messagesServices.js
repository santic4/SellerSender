/**
 * Obtiene los mensajes pendientes desde la API de Mercado Libre.
 * @param {string} token Token de acceso válido.
 * @returns {Promise<object[]>} Lista de mensajes.
 */
export const fetchPendingMessages = async (token) => {

    try {

      const response = await fetch("https://api.mercadolibre.com/my/received_questions/search?status=UNANSWERED&limit=50&offset=0&api_version=4", {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      });
  
      if (!response.ok) {
        console.error("Error en la respuesta de la API:", response.status, response.statusText);
        throw new Error("Error al consultar la API de Mercado Libre");
      }
      
      console.log(response,'RESPONSE MESSAGES SERVICES')
  
      const data = await response.json();
      return data.messages?.map((msg) => ({
        message_id: msg.id,
        sender_name: msg.from.nickname,
        text: msg.text,
      })) || [];
    } catch (error) {
      console.error("Error al obtener mensajes desde la API:", error.message);
      throw error;
    }
  };