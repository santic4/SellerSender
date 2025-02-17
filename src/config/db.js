import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI
export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('La variable MONGO_URI no está definida.');
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a la base de datos MongoDB');
  } catch (error) {
    console.error('Error al conectar a la base de datos', error.message);
    process.exit(1);
  }
};
