import dotenv from 'dotenv';

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI

export const REDIRECT_URI = process.env.REDIRECT_URI

export const CLIENT_SECRET = process.env.CLIENT_SECRET

export const CLIENT_ID = process.env.CLIENT_ID

export const PORT = process.env.PORT

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN