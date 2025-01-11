import fetch from "node-fetch";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "../config/config.js";

export const getAuthUrl = (req, res) => {
  const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  console.log("URL de autenticación:", authUrl);
  res.json({ authUrl });
};

export const callback = async (req, res) => {
  const { code } = req.query;

  try {
    // Intercambio del código de autorización por tokens
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      console.error('Error al obtener el token:', response.statusText);
      return res.status(response.status).json({ error: 'No se pudo autenticar' });
    }

    const data = await response.json();
    console.log(data,'data en callback')
    const { access_token, refresh_token } = data;

    // Guardar los tokens en cookies HttpOnly
    res.cookie('accessToken', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // 1 hora
      sameSite: 'Strict',
    });
    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // 1 hora
      sameSite: 'Strict',
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error al autenticar:', error.message);
    res.status(500).json({ error: 'No se pudo autenticar' });
  }
};

export const checkAuth = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    // Verificar el token (puedes usar una librería JWT si es necesario)
    // Asegúrate de manejar errores y tokens expirados de forma segura
    console.log(token,'token en check')

    res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    console.error("Error al validar el token:", error.message);
    res.status(401).json({ isAuthenticated: false });
  }
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Obtener el token desde las cookies

  if (!refreshToken) {
    return res.status(401).json({ error: "No hay un token de refresco disponible" });
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
      return res.status(response.status).json({ error: "No se pudo refrescar el token de acceso" });
    }

    const data = await response.json();
    const { access_token, refresh_token, expires_in } = data;

    // Actualizar cookies con los nuevos tokens
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: expires_in * 1000, // Tiempo de expiración en milisegundos
    };

    res.cookie("accessToken", access_token, cookieOptions);
    res.cookie("refreshToken", refresh_token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({ message: "Token de acceso actualizado", accessToken: access_token });
  } catch (error) {
    console.error("Error al refrescar el token:", error.message);
    res.status(500).json({ error: "No se pudo refrescar el token de acceso" });
  }
};

export const getAccessToken = (req, res) => {
  const accessToken = req.cookies.accessToken; // Obtener el token desde las cookies
  if (!accessToken) {
    return res.status(401).json({ error: "No se encontró un token de acceso válido" });
  }
  res.json({ accessToken });
};
