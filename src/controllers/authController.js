import fetch from "node-fetch";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "../config/config.js";

let accessToken = '';
let refreshToken = '';

export const getAuthUrl = (req, res) => {
  const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  console.log("URL de autenticación:", authUrl);
  res.json({ authUrl });
};

export const callback = async (req, res) => {
  const { code } = req.query;

  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      console.error("Error al obtener el token:", response.statusText);
      return res.status(response.status).json({ error: "No se pudo autenticar" });
    }

    const data = await response.json();
    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    console.log("Token obtenido:", { accessToken, refreshToken });
    res.json({ message: "Autenticación completada", accessToken });
  } catch (error) {
    console.error("Error al autenticar:", error.message);
    res.status(500).json({ error: "No se pudo autenticar" });
  }
};

export const refreshAccessToken = async () => {
  if (!refreshToken) {
    throw new Error("No hay un token de refresco disponible");
  }

  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Error al refrescar el token:", errorBody);
      throw new Error("No se pudo refrescar el token de acceso");
    }

    const data = await response.json();
    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    console.log("Token refrescado:", { accessToken, refreshToken });
  } catch (error) {
    console.error("Error al refrescar el token:", error.message);
    throw error;
  }
};

export const getAccessToken = () => accessToken;
