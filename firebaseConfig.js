// firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getReactNativePersistence, initializeAuth, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY_PRINCIPAL,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN_PRINCIPAL,
    databaseURL: process.env.FIREBASE_DATABASE_URL_PRINCIPAL,
    projectId: process.env.FIREBASE_PROJECT_ID_PRINCIPAL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET_PRINCIPAL,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_PRINCIPAL,
    appId: process.env.FIREBASE_APP_ID_PRINCIPAL,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID_PRINCIPAL
};

const firebaseConfigAdmin = {
    apiKey: process.env.FIREBASE_API_KEY_ADMIN,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN_ADMIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL_ADMIN,
    projectId: process.env.FIREBASE_PROJECT_ID_ADMIN,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET_ADMIN,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_ADMIN,
    appId: process.env.FIREBASE_APP_ID_ADMIN,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID_ADMIN
};

// Inicializa os aplicativos com nomes diferentes para evitar conflitos
const app = getApps().find(app => app.name === 'principal') || initializeApp(firebaseConfig, 'principal');

// O app de admin está com o nome 'admin'
const adminApp = getApps().find(app => app.name === 'admin') || initializeApp(firebaseConfigAdmin, 'admin');

const database = getDatabase(app);
const adminDatabase = getDatabase(adminApp);

// Inicializa a autenticação com a persistência AsyncStorage
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Outras instâncias de serviços
const googleProvider = new GoogleAuthProvider();

export { auth, database, adminDatabase, googleProvider, app, adminApp };