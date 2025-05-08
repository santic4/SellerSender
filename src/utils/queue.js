import { Queue, Worker } from "bullmq";
import { getValidAccessToken } from "../controllers/paymentsController.js";
import { processWebhookNotification } from "../services/webhookService.js";
import { checkExistingOrder, saveOrderServices } from "../services/paymentsServices.js";
import { sendMessage } from "../services/messagesServices.js";
import { deliveredService } from "../services/deliveredServices.js";
import { REACT_APP_HOST_REDIS, REACT_APP_PORT_REDIS } from "../config/config.js";

const redisConnection = {
    host: REACT_APP_HOST_REDIS, 
    port: REACT_APP_PORT_REDIS
};

// Crear la cola de trabajo para los webhooks
export const webhookQueue = new Queue("webhookQueue", { connection: redisConnection });

// Definir el Worker para procesar las tareas en segundo plano
new Worker("webhookQueue", async (job) => {
    const { topic, resource } = job.data;
    
    console.log(`Procesando webhook en background: ${topic}`);

    try {
        const accessToken = await getValidAccessToken();
        
        const result = await processWebhookNotification(topic, resource, accessToken);

        const orderExists = await checkExistingOrder(result);

        if (orderExists) {
            console.log("Orden ya procesada, ignorando webhook.");
            return;
        }

        await sendMessage(result, accessToken);
        console.log("Mensaje enviado.");

        await saveOrderServices(result);

        try {
          await deliveredService(resource, accessToken);
          console.log("Entrega marcada como completada.");
        } catch (err) {
          console.error("⚠️ No se pudo marcar la entrega como completada:", err.message);
        }
      
        console.log("Orden guardada exitosamente.");
    } catch (error) {
        console.error("Error procesando el webhook en la cola:", error.message);
    }
}, { connection: redisConnection });