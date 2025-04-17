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
    // Extraer el orderId del recurso
    const orderId = resource.split('/').pop();
    if (!orderId) {
      throw new Error('No existe el orderId.');
    }
    console.log(orderId, 'orderId');

    // Obtener detalles de la orden
    const orderDetails = await fetchOrderDetails(orderId, accessToken);
    console.log(orderDetails, 'Detalles de la orden en webhook');

    // Filtrar órdenes creadas antes del 10 de marzo de 2025
    const orderCreationDate = new Date(orderDetails.date_created);
    const cutoffDate = new Date('2025-03-10T00:00:00Z');
    if (orderCreationDate < cutoffDate) {
      console.log('Orden creada antes del 10 de marzo de 2025, omitiendo...');
      return;
    }

<<<<<<< HEAD
    // Filtrar si la orden fue creada antes del 10 de marzo de 2025
    const orderCreationDate = new Date(orderDetails.date_created);
    const cutoffDate = new Date('2025-03-10T00:00:00Z'); // 10 de marzo de 2025 en formato UTC
  
    if (orderCreationDate < cutoffDate) {
      console.log('Orden creada antes del 10 de marzo de 2025, omitiendo...');
      return; 
    }
=======
    // Procesar cada item de la orden
    const itemsWithProductDetails = await Promise.all(orderDetails.order_items.map(async (item) => {
      // Imprimir algunos logs para depuración
      console.log(orderDetails.order_items[0].item, 'Primer item de la orden');
      console.log(orderDetails.order_items, 'Todos los items de la orden');

      // Buscar el producto y hacer populate de las plantillas globales y de variaciones
      const product = await Product.findOne({ id: item.item.id })
        .populate("templates.templateId")
        .populate("variations.templates.templateId");

      if (!product) {
        throw new Error(`Producto con ID ${item.item.id} no encontrado`);
      }
>>>>>>> 4fe793c66c83666fc0b84a14aa7d1542f8ec9e8d

      let templatesWithContent = [];

      // Si existe una variación en el item, buscar la variante correspondiente
      if (item.item.variation_id && Array.isArray(product.variations)) {
        const variation = product.variations.find(v => v.id === String(item.item.variation_id));
        console.log(variation,'variation1')

        if (variation && Array.isArray(variation.templates)) {
          templatesWithContent = variation.templates.map(template => ({
            name: template.name,
            content: template.templateId ? template.templateId.content : null,
          }));
        }
      }

      console.log(templatesWithContent,'templatesWithContent1')

      // Si no se encontraron plantillas en la variación, usar las plantillas globales del producto
      if (templatesWithContent.length === 0 && Array.isArray(product.templates)) {
        console.log(product.templates,'product.templates')
        templatesWithContent = product.templates.map(template => ({
          name: template.name,
          content: template.templateId ? template.templateId.content : null,
        }));
      }

      console.log(templatesWithContent,'templatesWithContent2')
      return {
        ...item,
        product: {
          id: product.id,
          templates: templatesWithContent,
        },
      };
    }));

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
