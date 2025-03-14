
/**
 * Controlador para obtener webhooks del pago
 * @param {object} req 
 * @param {object} res 
*/

import { tokenServices } from "../services/testServices.js";
import { webhookQueue } from "../utils/queue.js";

export const getValidAccessToken = async () => {
  const token = await tokenServices.getTokenFromDB();

  if (!token) {
    console.log("No hay token en la base de datos, generando uno nuevo...");
    return await tokenServices.refreshAccessToken();
  }

  const now = Date.now();
  const lastUpdated = new Date(token.lastUpdated).getTime();
  const tokenAge = now - lastUpdated; // Convertimos a milisegundos

  const expiresInMs = Number(token.expiresIn) * 1000; // Convertimos a milisegundos

  if (isNaN(expiresInMs) || tokenAge >= expiresInMs) {
    console.log("El token expiró, renovando...");
    return await tokenServices.refreshAccessToken();
  }

  return token.accessToken;
};

export const webhookPayment = async (req, res) => {
    try {
        const { topic, resource } = req.body;
    
        console.log(topic,'topic', resource, 'resource')
        if (!topic || !resource) {
          return res.status(400).json({ error: 'Solicitud inválida, faltan datos requeridos.' });
        }

        // Enviar el webhook a la cola 
        await webhookQueue.add("processWebhook", { topic, resource });

        res.status(200).json({ message: "Webhook recibido y en cola para procesamiento." });
      } catch (error) {
        console.error('Error al procesar el webhook:', error.message);
        res.status(500).json({ error: 'Error al procesar la notificación' });
      }
  };