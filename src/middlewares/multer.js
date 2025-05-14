import multer from 'multer';
import { memoryStorage } from 'multer';

// Configuración de Multer para manejar la carga de archivos en memoria
const storage = new memoryStorage();

// Configuración de Multer con límite de tamaño
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10 GB
  },
});

export { upload };