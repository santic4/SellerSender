import fetch from 'node-fetch';
import { getAccessToken } from './authService.js';

/**
 * Procesa una notificación del webhook de Mercado Libre.
 * @param {string} topic - Tópico de la notificación (e.g., "orders_v2").
 * @param {string} resource - URL del recurso asociado a la notificación.
 * @returns {object} - Datos procesados del recurso.
 */
export const processWebhookNotification = async (topic, resource) => {
  try {

    // Obtén el ID de la orden desde el recurso
    const orderId = resource.split('/').pop();

    // Llama al servicio de Mercado Libre para obtener los detalles de la orden
    const orderDetails = await fetchOrderDetails(orderId);

    // Extrae el ID del ítem vendido
    const itemId = orderDetails.order_items[0].item.id;

    // Devuelve los detalles procesados
    return { orderId, itemId };
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
export const fetchOrderDetails = async (orderId) => {


  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No se encontró el token de acceso. Asegúrate de estar autenticado.');
  }

  console.log('pase', accessToken)
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

  return await response.json();
};
