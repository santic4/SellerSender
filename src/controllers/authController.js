import fetch from "node-fetch";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "../config/config";

let accessToken = '';
let refreshToken = '';

export const getAuthUrl = (req, res) => {
  const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`;
  console.log(authUrl,'authUrl')
  res.json({ authUrl });
};

export const callback = async (req, res) => {
  const { code } = req.query;
  console.log('coso de query que deberia ser params')
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

    const data = await response.json();
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    res.json({ message: "Autenticación completada", accessToken });
  } catch (error) {
    console.error("Error al autenticar:", error);
    res.status(500).json({ error: "No se pudo autenticar" });
  }
};

export const getAccessToken = () => accessToken;