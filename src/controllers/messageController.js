import Message from "../models/Message.js";
import { requestTokens } from "../services/authService.js";
import { fetchPendingMessages } from "../services/messagesServices.js";
import { getAccessToken, refreshAccessToken } from "./authController.js";
import fetch from "node-fetch";


/**
 * Controlador para obtener mensajes pendientes.
 * @param {object} req Objeto de solicitud.
 * @param {object} res Objeto de respuesta.
 */
export const getMessages = async (req, res) => {
  const { code } = req.query; 

  try {
    // Obtener un token de acceso válido
    const token = await requestTokens(code);

    if(!token){
      throw new Error('No existe el token.');
    }

    // Obtener los mensajes pendientes
    const messages = await fetchPendingMessages(token);

    // Almacenar mensajes en la base de datos
    if (messages.length > 0) {
      await Message.insertMany(messages, { ordered: false });
    }else{
      throw new Error('Los mensajes son 0.')
    }

    res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error.message);
    res.status(500).json({ error: "No se pudo obtener los mensajes" });
  }
};

export const replyMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  try {
    // Obtener el token de acceso
    let token = getAccessToken();
    if (!token) {
      console.error("No se encontró un token de acceso válido. Intentando refrescar...");
      await refreshAccessToken();
      token = getAccessToken();
    }

    const response = await fetch(`https://api.mercadolibre.com/messages/${messageId}/reply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Error al responder mensaje:", errorBody);
      throw new Error("No se pudo enviar el mensaje");
    }

    res.json({ message: "Mensaje enviado exitosamente" });
  } catch (error) {
    console.error("Error al responder mensaje:", error.message);
    res.status(500).json({ error: "No se pudo responder el mensaje" });
  }
};
