import { Queue, Worker } from "bullmq";
import { getValidAccessToken } from "../controllers/paymentsController.js";
import { processWebhookNotification } from "../services/webhookService.js";
import { checkExistingOrder, saveOrderServices } from "../services/paymentsServices.js";
import { sendMessage } from "../services/messagesServices.js";

const redisConnection = {
    host: "red-cvaak6ij1k6c73e4u3g0", 
    port: 6379
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

        console.log("Orden guardada exitosamente.");
    } catch (error) {
        console.error("Error procesando el webhook en la cola:", error.message);
    }
}, { connection: redisConnection });