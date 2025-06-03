import { Queue, Worker } from "bullmq";
import { getValidAccessToken } from "../controllers/paymentsController.js";
import { processWebhookNotification } from "../services/webhookService.js";
import { checkExistingOrder, saveOrderServices } from "../services/paymentsServices.js";
import { sendMessage, sendSecondMessage } from "../services/messagesServices.js";
import { deliveredService } from "../services/deliveredServices.js";
import { REACT_APP_HOST_REDIS, REACT_APP_PORT_REDIS } from "../config/config.js";

const redisConnection = {
    host: REACT_APP_HOST_REDIS, 
    port: REACT_APP_PORT_REDIS
};

// Crear la cola de trabajo para los webhooks
export const webhookQueue = new Queue("webhookQueue", { connection: redisConnection });
const delayedMessageQueue = new Queue("delayedMessageQueue", { connection: redisConnection });

// Worker para procesar las tareas principales
new Worker("webhookQueue", async (job) => {
    const { topic, resource } = job.data;
    
    console.log(`Procesando webhook en background: ${topic}`);

    try {
        const accessToken = await getValidAccessToken();
        
        const result = await processWebhookNotification(topic, resource, accessToken);

        console.log(result,'result antes de sress')
        const orderExists = await checkExistingOrder(result);
        console.log(orderExists,'orderExists')

        if (orderExists) {
            console.log("Orden ya procesada, ignorando webhook.");
            return;
        }
        console.log(result,'orderExistsresultl')

        await sendMessage(result, accessToken);
        console.log("Mensaje enviado.");

        await saveOrderServices(result);

        try {
          await deliveredService(resource, accessToken);
          console.log("Entrega marcada como completada.");
        } catch (err) {
          console.error("⚠️ No se pudo marcar la entrega como completada:", err.message);
        }

        console.log('antes del delay')

        // ➕ NUEVO: Programar mensaje diferido a las 36hs
        await delayedMessageQueue.add(
          "sendSecondMessage",
          {
            orderId: result.orderId, 
            secondMessagesSend: result.secondMessages,
            buyerId: result.buyerId
          },
          {
            delay: 1 * 60 * 60 * 1000,
            attempts: 2, // Reintentos si falla
          }
        );
      
        console.log("Orden guardada exitosamente.");
    } catch (error) {
        console.error("Error procesando el webhook en la cola:", error.message);
    }
}, { connection: redisConnection });

// Worker para procesar las tareas del delay messages
new Worker("delayedMessageQueue", async (job) => {
    const { orderId, secondMessagesSend, buyerId } = job.data;
  
    try {
        console.log(orderId,' ORDERIDDELAY', secondMessagesSend, 'PACKIDDELAY', buyerId, 'BUYERIDDELAY')
      const accessToken = await getValidAccessToken();
  
      const message = await sendSecondMessage( orderId, secondMessagesSend, buyerId, accessToken );
  
      console.log("Mensaje retrasado enviado correctamente.",message);
    } catch (err) {
      console.error("❌ Error enviando mensaje retrasado:", err.message);
    }
  }, { connection: redisConnection });