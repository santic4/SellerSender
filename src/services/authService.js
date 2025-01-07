import fetch from "node-fetch";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "../config/config.js";

let accessToken = "";
let refreshToken = "";

/**
 * Solicita tokens de acceso y refresco utilizando un código de autorización.
 * @param {string} code Código de autorización recibido.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} Tokens de acceso y refresco.
 */
export const requestTokens = async (code) => {
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
      const errorBody = await response.json();
      console.error("Error al obtener los tokens:", errorBody);
      throw new Error("No se pudo obtener los tokens");
    }

    const data = await response.json();
    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error al solicitar los tokens:", error.message);
    throw error;
  }
};

/**
 * Refresca el token de acceso utilizando el token de refresco.
 * @returns {Promise<void>}
 */
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

/**
 * Obtiene el token de acceso actual o lo refresca si es necesario.
 * @param {string} code Código de autorización recibido.
 * @returns {Promise<string>} Token de acceso válido.
 */
export const getAccessToken = async (code) => {
  if (accessToken) {
    return accessToken;
  }

  if (code) {
    const tokens = await requestTokens(code);
    return tokens.accessToken;
  }

  await refreshAccessToken();
  return accessToken;
};
