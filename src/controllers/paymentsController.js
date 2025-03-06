
/**
 * Controlador para obtener webhooks del pago
 * @param {object} req 
 * @param {object} res 
*/

import { sendMessage } from "../services/messagesServices.js";
import { checkExistingOrder, saveOrderServices } from "../services/paymentsServices.js";
import { tokenServices } from "../services/testServices.js";
import { processWebhookNotification } from "../services/webhookService.js";

const getValidAccessToken = async () => {
  const token = await tokenServices.getTokenFromDB();

    console.log("token",token);
    
    return await tokenServices.refreshAccessToken();

};

export const webhookPayment = async (req, res) => {
    try {
        const { topic, resource } = req.body;
    
        console.log(topic,'topic', resource, 'resource')
        if (!topic || !resource) {
          return res.status(400).json({ error: 'Solicitud inválida, faltan datos requeridos.' });
        }

        const accessToken = await getValidAccessToken();

        console.log('1 controller payments', accessToken)
        const result = await processWebhookNotification(topic, resource, accessToken);

        const orderExists = await checkExistingOrder(result);
        
        if (orderExists) {
            return res.status(200).json({ message: 'Orden ya procesada, ignorando webhook.' });
        }
    
        console.log(result,'2 controller payments')

        await sendMessage(result, accessToken);
        console.log('3 controller payments, mensaje enviado')

        await saveOrderServices(result);
         console.log('4 controller payments')

        res.status(200).json({ message: 'Notificación procesada correctamente', data: result });
      } catch (error) {
        console.error('Error al procesar el webhook:', error.message);
        res.status(500).json({ error: 'Error al procesar la notificación' });
      }
  };