
/**
 * Controlador para obtener webhooks del pago
 * @param {object} req 
 * @param {object} res 
*/

import { processWebhookNotification } from "../services/webhookService.js";

export const webhookPayment = async (req, res) => {
    try {
        const { topic, resource } = req.body;
    
        if (!topic || !resource) {
          return res.status(400).json({ error: 'Solicitud inválida, faltan datos requeridos.' });
        }
    
        // Procesa la notificación y obtiene el resultado
        const result = await processWebhookNotification(topic, resource);
    
        // Respuesta con éxito y detalle del procesamiento
        res.status(200).json({ message: 'Notificación procesada correctamente', data: result });
      } catch (error) {
        console.error('Error al procesar el webhook:', error.message);
        res.status(500).json({ error: 'Error al procesar la notificación' });
      }
  };