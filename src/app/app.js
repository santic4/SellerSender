import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import cookieParser from 'cookie-parser';
import apiRouter from '../router/apiRouter.js';
import "../utils/queue.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.static(path.join('public', 'build')));

app.use(cors({
    origin: 'https://sellersender.onrender.com',
    credentials: true 
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://sellersender.onrender.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});
   
// Middleware de CSP
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' http: https: data:; connect-src 'self' https://api.paypal.com https://api.mercadopago.com;"
    );
    next();
});

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', apiRouter);


// Configura el middleware de archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/statics/photos', express.static(path.join(__dirname, '../../statics/photos')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'build', 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/build', 'index.html'));
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));