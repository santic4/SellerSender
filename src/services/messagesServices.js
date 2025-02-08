import { ACCESS_TOKEN, CLIENT_ID } from "../config/config.js";
import { userServices } from "./usersServices.js";

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

      const data = await response.json();

      return data.questions?.map((msg) => ({
        message_id: msg.id,
        sender_name: msg.seller_id,
        text: msg.text,
      })) || [];
    } catch (error) {
      console.error("Error al obtener mensajes desde la API:", error.message);
      throw error;
    }
  };

  
  export const sendMessage = async (result, accessToken) => {
    try {
      console.log('antes del token send message');
  
      if (!accessToken) {
        throw new Error('No se encontró el token de acceso. Asegúrate de estar autenticado.');
      }
  
      console.log('despues del token send message');
      const sellerId = await userServices.getInfoUserServices(accessToken);
      console.log(sellerId, 'sellerId');
  
      const PACK_ID = result.pack_id ? result.pack_id : result.orderId;
  
      for (const item of result.items) {
        const product = item.product;
  
        // Array para almacenar todas las promesas de los mensajes
        const messagePromises = [];
  
        for (const template of product.templates) {
          const message = {
            from: {
              user_id: sellerId,
            },
            to: {
              user_id: result.buyerId,
            },
            text: template.content,
            attachments: [],
          };
  
          console.log(product, 'antes de mandar mensaje en message services');
  
          // Crear promesa para el fetch
          const messagePromise = fetch(
            `https://api.mercadolibre.com/messages/packs/${PACK_ID}/sellers/${sellerId}?tag=post_sale`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'x-client-id': `${CLIENT_ID}`,
              },
              body: JSON.stringify(message),
            }
          )
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) {
                console.log(`Mensaje enviado correctamente a ${result.buyerId}:`, template.content);
              } else {
                console.error(`Error al enviar mensaje: ${data.message}`);
              }
              return data;
            })
            .catch((error) => {
              console.error('Error en la solicitud de mensaje:', error.message);
              throw error;
            });
  
          // Agregar la promesa al array
          messagePromises.push(messagePromise);
        }
  
        // Esperar a que todas las solicitudes de mensajes se completen antes de continuar
        await Promise.all(messagePromises);
      }
      
      console.log('Todos los mensajes fueron enviados correctamente.');
    } catch (error) {
      console.error('Error al procesar la notificación:', error.message);
      throw error;
    }
  };