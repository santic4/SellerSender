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

    const orderId = resource.split('/').pop();

    if(!orderId){
      throw new Error('No existe el orderId.')
    }

    const orderDetails = await fetchOrderDetails(orderId, accessToken);

    // Filtrar si la orden fue creada antes del 10 de marzo de 2025
    const orderCreationDate = new Date(orderDetails.date_created);
    const cutoffDate = new Date('2025-03-10T00:00:00Z'); // 10 de marzo de 2025 en formato UTC
  
    if (orderCreationDate < cutoffDate) {
      console.log('Orden creada antes del 10 de marzo de 2025, omitiendo...');
      return; 
    }

    let allSecondMessages = [];

    const itemsWithProductDetails = await Promise.all(orderDetails.order_items.map(async (item) => {

            console.log(orderDetails.order_items.item,'orderDetails.order_items.item')
      console.log(orderDetails.order_items[0].item,'orderDetails.order_items[0].item')
      console.log(orderDetails.order_items,'orderDetails.order_items')

      const product = await Product.findOne({ id: item.item.id });
 
      if (!product) {
        throw new Error(`Producto con ID ${item.item.id} no encontrado`);
      }
       console.log(product,'¡product 1')

      let templatesWithContent = [];

      // Buscar variaciones si existen
      if (item.item.variation_id && Array.isArray(product.variations)) {
        const variation = product.variations.find(v => v.id === String(item.item.variation_id));
        
        console.log(product,'¡product 2')
        if (variation && Array.isArray(variation.templates)) {
          templatesWithContent = await Promise.all(
            variation.templates.map(async tpl => {
              const tplDoc = await Template.findById(tpl.templateId);
              return {
                name: tpl.name,
                content: tplDoc?.content || null,
              };
            })
          );
        }
      }

      // Si no hay variaciones, usar plantillas globales
      if (templatesWithContent.length === 0 && Array.isArray(product.templates)) {
        templatesWithContent = await Promise.all(product.templates.map(async (template) => {
          const templateDetails = await Template.findById(template.templateId);
          
          return {
            name: template.name,
            content: templateDetails?.content || null,
          };
        }));
      }

      // Procesar secondMessages si existen

      const lastTemplateIds = new Set();

      if (Array.isArray(product.secondMessages) && product.secondMessages.length > 0) {

        console.log(product.secondMessages,'product.secondMessages en webhook services ')
        for (const sm of product.secondMessages) {

          const templateIdStr = String(sm.templateId);

          console.log(templateIdStr,' templateIDSTR webhook')

          if (!lastTemplateIds.has(templateIdStr)) {
            const tplDoc = await Template.findById(templateIdStr);
            allSecondMessages.push({
              templateId: templateIdStr,
              name: tplDoc?.name,
              content: tplDoc?.content || null,
              attachments: tplDoc?.attachments || [], 
            });

            lastTemplateIds.add(templateIdStr);
          } else {
            console.log(`Template ${templateIdStr} ya incluida en secondMessages, omitiendo duplicado.`);
          }

        }
      }

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
      secondMessages: allSecondMessages
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

         console.log(orderId,'orderId2')
  if (!accessToken) {
    throw new Error('No se encontró el token de acceso. Asegúrate de estar autenticado.');
  }
       console.log(orderId,'orderId3')
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
  
  return orderCaptured;
};
