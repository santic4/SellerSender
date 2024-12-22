import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import authRoutes from '../routes/authRouter.js'
import templateRoutes from '../routes/templateRoutes.js';
import messagesRoutes from '../routes/messagesRoutes.js'

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use("/api/messages", messagesRoutes);
app.use('/api/templates', templateRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));