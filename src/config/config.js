import dotenv from 'dotenv';

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI

export const REDIRECT_URI = process.env.REDIRECT_URI

export const CLIENT_SECRET = process.env.CLIENT_SECRET

export const CLIENT_ID = process.env.CLIENT_ID

export const PORT = process.env.PORT

export const CLIENT_ID_PERMITIDO = process.env.CLIENT_ID_PERMITIDO

export const REACT_APP_PORT_REDIS = process.env.REACT_APP_PORT_REDIS

export const REACT_APP_HOST_REDIS = process.env.REACT_APP_HOST_REDIS

export const projectId = process.env.FIREBASE_PROJECT_ID;
export const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
export const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
