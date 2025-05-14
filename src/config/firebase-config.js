import admin from 'firebase-admin';
import { clientEmail, privateKey, projectId } from './config.js';

const storageBucket = 'alfil-digital.appspot.com';

if (!projectId || !clientEmail || !privateKey || !storageBucket) {
  throw new Error(`Missing Firebase configuration environment ${privateKey}variables.`);
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

const bucket = admin.storage().bucket();

export { bucket };