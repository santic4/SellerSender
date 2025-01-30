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

