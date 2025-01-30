import Token from "../models/Token.js";
import { tokenServices } from "../services/testServices.js";

const getValidAccessToken = async () => {
  console.log('entre al test getValidAccessToken')
  const token = await tokenServices.getTokenFromDB();
  console.log(token,'tokem')
  const now = Date.now();
  const tokenAge = (now - new Date(token.lastUpdated).getTime()) / 1000; // en segundos

  if (tokenAge >= token.expiresIn) {
    console.log("El token expiró, renovando...");
    return await tokenServices.refreshAccessToken();
  }

  console.log('antes del token tested')
  const tokenTested = token.accessToken;

  console.log(tokenTested,'token tested')
  return tokenTested;
};

export const testController = async (req, res) => {

  try {
    console.log('entre al test controller')
    const accessToken = await getValidAccessToken();
    console.log(accessToken,'accessToken')
    res.status(201).json(accessToken);
  } catch (error) {
    console.error('Error al testear:', error);
    res.status(500).send('Error al testear');
  }
};

export const createExpiredToken = async (req, res) => {
  try {
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() - 2); // Hace que el token parezca de hace 2 horas

    const expiredToken = await Token.create({
      accessToken: "APP_USR-987056470459208-012921-acccb51350b09abc7665ef7905e58a8a-674717908",
      refreshToken: "TG-679ad6d3ae42e30001c209a6-674717908",
      expiresIn: 21600, // 1 hora de validez
      lastUpdated: expiredDate, // Fecha en el pasado
    });

    console.log("Token expirado creado en la base de datos.");
    res.status(201).json(expiredToken);
  } catch (error) {
    console.error("Error al crear el token expirado:", error);
    res.status(500).send("Error al crear el token expirado");
  }
};
