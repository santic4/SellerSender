
/**
 * Controlador para obtener webhooks del pago
 * @param {object} req 
 * @param {object} res 
*/

import { sendMessage } from "../services/messagesServices.js";
import { saveOrderServices } from "../services/paymentsServices.js";
import { processWebhookNotification } from "../services/webhookService.js";

export const webhookPayment = async (req, res) => {
    try {
        const { topic, resource } = req.body;
    
        if (!topic || !resource) {
          return res.status(400).json({ error: 'Solicitud inválida, faltan datos requeridos.' });
        }

        console.log('1 controller payments')
        const result = await processWebhookNotification(topic, resource);
    
        console.log(result,'2 controller payments')

        await sendMessage(result);
        console.log('3 controller payments')

        //await saveOrderServices(result);
        // console.log('4 controller payments')
        res.status(200).json({ message: 'Notificación procesada correctamente', data: result });
      } catch (error) {
        console.error('Error al procesar el webhook:', error.message);
        res.status(500).json({ error: 'Error al procesar la notificación' });
      }
  };