import { CLIENT_ID } from "../config/config.js";
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


/**
* Sube una imagen (o cualquier archivo) a MercadoLibre y devuelve el file_id resultante.
*/

async function uploadToMercadoLibre(fileUrl, accessToken) {
  // 1) Descargamos el blob desde Firebase
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar la imagen: ${response.statusText}`);
  }
  const blob = await response.blob();

  console.log(blob,'blob en upload')
  
  // 2) Preparamos el FormData para ML
  const form = new FormData();
  form.append('file', blob, 'attachment.jpg');  // el nombre es arbitrario

  // 3) Enviamos al endpoint de attachments
  const mlResponse = await fetch(
    'https://api.mercadolibre.com/messages/attachments',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form
    }
  );
  const mlData = await mlResponse.json();

  console.log(mlData,'ml data ')
  if (!mlResponse.ok) {
    throw new Error(`Error subiendo a ML: ${mlData.message}`);
  }

  // 4) Devolvemos el file_id
  return mlData.id;  
}


  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  export const sendMessage = async (result, accessToken) => {
    try {
      if (!accessToken) {
        throw new Error('No se encontró el token de acceso. Asegúrate de estar autenticado.');
      }
  
      const sellerId = await userServices.getInfoUserServices(accessToken);

  
      console.log(result,'estoy en send message')
      const PACK_ID = result.pack_id ? result.pack_id : result.orderId;
  
      const fileIdCache = {};

      for (const item of result.items) {
        const product = item.product;
      
        for (const template of product.templates) {
          // 1) Convertir cada URL a file_id
          const attachmentsArray = [];
          
          if (Array.isArray(template.attachments) && template.attachments.length > 0) {
            for (const url of template.attachments) {
              const fileId = fileIdCache[url] || await uploadToMercadoLibre(url, accessToken);
              fileIdCache[url] = fileId;
              attachmentsArray.push({ id: fileId, type: 'image' });
            }
          }
        
          // 2) Construir el mensaje
          const message = {
            from: { user_id: sellerId },
            to:   { user_id: result.buyerId }, 
            text: template.content,
            attachments: attachmentsArray
          };
  
          console.log(`Enviando mensaje: "${template.content}"`);
  
          // Enviar el mensaje de forma secuencial
          const response = await fetch(
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
          );
  
          const data = await response.json();

          if (response.ok) {
            console.log(`Mensaje enviado correctamente a ${result.buyerId}: "${template.content}"`);
          } else {
            console.error(`Error al enviar mensaje: ${data.message}`);
          }

          await delay(1000);
        }
      }
  
      console.log('Todos los mensajes fueron enviados correctamente en el orden esperado.');
    } catch (error) {
      console.error('Error al procesar la notificación:', error.message);
      throw error;
    }
  };
  

export const sendSecondMessage = async (orderId, secondMessagesSend, buyerId, accessToken) => {
  try {

    const sellerId = await userServices.getInfoUserServices(accessToken);

    const fileIdCache = {};  
    for (const item of secondMessagesSend) {
    
      const attachmentsArray = [];

      for (const url of item.attachments) {
        const fileId = fileIdCache[url] || await uploadToMercadoLibre(url, accessToken);
        fileIdCache[url] = fileId;
        attachmentsArray.push(fileId); 
      }

      // 2) Verificar y convertir sellerId y buyerId a string si es necesario
      const sellerIdStr = typeof sellerId === 'string' ? sellerId : String(sellerId);
      const buyerIdStr = typeof buyerId === 'string' ? buyerId : String(buyerId);

      // 3) Construir el mensaje
      const message = {  
        from: {
          user_id: sellerIdStr
        },
        to: {
          user_id: buyerIdStr
        },
        text: item.content,
        ...(attachmentsArray.length > 0 && { attachments: attachmentsArray })
      };
      console.log("Enviando segundo mensaje (antesparsing):", JSON.stringify(message, null, 2));

      // Enviar el mensaje de forma secuencial
      const response = await fetch(
        `https://api.mercadolibre.com/messages/packs/${orderId}/sellers/${sellerId}?tag=post_sale`,
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
      );  
      const data = await response.json();
  
      if (response.ok) {
        console.log(`Segundo mensaje enviado correctamente a ${buyerId}: "${item.content}"`);
      } else {
        console.error(`Error al enviar mensaje: ${data.message}`);
      }
      await delay(1000);
    }

    console.log('Todos los mensajes fueron enviados correctamente en el orden esperado.');
  } catch (error) {
    console.error('Error al procesar la notificación:', error.message);
    throw error;
  }
};
