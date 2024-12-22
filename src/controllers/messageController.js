import Message from "../models/Message.js";
import { getAccessToken } from "./authController.js";
import fetch from "node-fetch";

export const getMessages = async (req, res) => {

  try {
    const response = await fetch("https://api.mercadolibre.com/messages/pending", {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });

    if (!response.ok) {
      console.error("Error en la respuesta de la API:", response.status, response.statusText);
      return res.status(500).json({ error: "Error al consultar la API de Mercado Libre" });
    }

    const data = await response.json();
    console.log("Respuesta de la API:", data);

    const messages = data.messages
      ? data.messages.map((msg) => ({
          message_id: msg.id,
          sender_name: msg.from.nickname,
          text: msg.text,
        }))
      : [];

    if (messages.length > 0) {
      await Message.insertMany(messages, { ordered: false });
    }

    res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "No se pudo obtener los mensajes" });
  }
};

export const replyMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  try {
    const response = await fetch(`https://api.mercadolibre.com/messages/${messageId}/reply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) throw new Error("No se pudo enviar el mensaje");

    res.json({ message: "Mensaje enviado exitosamente" });
  } catch (error) {
    console.error("Error al responder mensaje:", error);
    res.status(500).json({ error: "No se pudo responder el mensaje" });
  }
};