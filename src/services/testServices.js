import { CLIENT_ID, CLIENT_SECRET } from "../config/config.js";
import Token from "../models/Token.js";


class TokenServices{

    async getTokenFromDB () {
      try {
        const token = await Token.findOne().lean(); 
        if (!token) {
          throw new Error("No se encontró ningún token en la base de datos");
        }
        return token;
      } catch (error) {
        console.error("Error al obtener token:", error.message);
        throw error;
      }
    };

    async updateTokenInDB (newAccessToken, newRefreshToken, expiresIn) {

        try {
          const updatedToken = await Token.findOneAndUpdate(
              {}, // Actualiza el primer documento encontrado
              {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn,
                lastUpdated: Date.now(),
              },
              { new: true, upsert: true } // Crea el documento si no existe
            );

            return updatedToken;
        } catch (error) {
          console.error("Error al actualizar token:", error.message);
          throw error;
        }
    };

    async refreshAccessToken() {

        try {
            const token = await this.getTokenFromDB();

            const url = "https://api.mercadolibre.com/oauth/token";
            const params = new URLSearchParams();
            params.append("grant_type", "refresh_token");
            params.append("client_id", `${CLIENT_ID}`); 
            params.append("client_secret", `${CLIENT_SECRET}`); 
            params.append("refresh_token", token.refreshToken);
        
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Error ${response.status}: ${errorData.message}`);
            }
        
            const { access_token, refresh_token, expires_in } = await response.json();
        
            // Actualiza el token en la base de datos
            const updatedToken = await this.updateTokenInDB(access_token, refresh_token, expires_in);
        
            console.log("Token actualizado:", updatedToken);
            return updatedToken.accessToken;
        } catch (error) {
          console.error("Error al actualizar token:", error.message);
          throw error;
        }
    };



}

export const tokenServices = new TokenServices()