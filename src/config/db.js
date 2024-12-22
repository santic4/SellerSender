import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a la base de datos MongoDB');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};
