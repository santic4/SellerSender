import express from "express";
import { callback, getAuthUrl} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/url", getAuthUrl);

authRouter.get('/callback', callback);

authRouter.get("/auth/check", (req, res) => {
    const token = req.cookies.accessToken;
  
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }
  
    try {
      // Verificar el token (puedes usar una librería JWT si es necesario)
      // Asegúrate de manejar errores y tokens expirados de forma segura
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ejemplo con JWT
  
      res.status(200).json({ isAuthenticated: true, user: decodedToken });
    } catch (error) {
      console.error("Error al validar el token:", error.message);
      res.status(401).json({ isAuthenticated: false });
    }
  });
export default authRouter;