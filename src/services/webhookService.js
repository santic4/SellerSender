import fetch from 'node-fetch';
import { Template } from '../models/Template.js';
import { Product } from '../models/Product.js';

/**
 * Procesa una notificación del webhook de Mercado Libre.
 * @param {string} topic - Tópico de la notificación (e.g., "orders_v2").
 * @param {string} resource - URL del recurso asociado a la notificación.
 * @returns {object} - Datos procesados del recurso.
 */

export const processWebhookNotification = async (topic, resource, accessToken) => {
  try {

    console.log('processWebhookNotifications')
    const orderId = resource.split('/').pop();

    if(!orderId){
      throw new Error('No existe el orderId.')
    }
    console.log(orderId,'orderId')

    const orderDetails = await fetchOrderDetails(orderId, accessToken);

    console.log(orderDetails,'1 webhook services')

    const itemsWithProductDetails = await Promise.all(orderDetails.order_items.map(async (item) => {

      const product = await Product.findOne({ id: item.item.id });
      console.log(product,'product services')
      const templatesWithContent = await Promise.all(product.templates.map(async (template) => {

        const templateDetails = await Template.findById(template.templateId);
        console.log(templateDetails,'product services templateDetails')
        return {
          name: template.name,
          content: templateDetails?.content,  
        };
      }));
      console.log(templatesWithContent,'templatesWithContent')

      return {
        ...item,
        product: {
          id: product.id,
          templates: templatesWithContent, 
        },
      };
    }));
    console.log(itemsWithProductDetails,'itemsWithProductDetails')
    return {
      orderId,
      buyerId: orderDetails.buyer.id,
      packId: orderDetails.pack_id,
      items: itemsWithProductDetails,
    };
  } catch (error) {
    console.error('Error al procesar la notificación:', error.message);
    throw error;
  }
};

/**
 * Obtiene los detalles de una orden desde la API de Mercado Libre.
 * @param {string} orderId - ID de la orden.
 * @returns {object} - Detalles de la orden.
 */
export const fetchOrderDetails = async (orderId, accessToken) => {

  console.log(accessToken,'accessToken')

  if (!accessToken) {
    throw new Error('No se encontró el token de acceso. Asegúrate de estar autenticado.');
  }

  const url = `https://api.mercadolibre.com/orders/${orderId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Error al obtener detalles de la orden:', errorBody);
    throw new Error(`Error al consultar la orden ${orderId}`);
  }

  const orderCaptured = await response.json();
  console.log(orderCaptured,'orderCaptured')
  return orderCaptured;
};
