// firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getReactNativePersistence, initializeAuth, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCIn7zTvqxa4BpzgSrUxHIK62D1ek0jQw4",
    authDomain: "espacomelu.firebaseapp.com",
    databaseURL: "https://espacomelu-default-rtdb.firebaseio.com",
    projectId: "espacomelu",
    storageBucket: "espacomelu.firebasestorage.app",
    messagingSenderId: "",
    appId: "1:90966792541:android:8ac95e87de8af0b1c6b0b4",
    measurementId: ""
};

const firebaseConfigAdmin = {
    apiKey: "AIzaSyBdhPa_6LB4VXl1w40Zkhcqrr9sB-uuZq4",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "https://admin-42d85-default-rtdb.firebaseio.com/",
    projectId: "admin-42d85",
    storageBucket: "admin-42d85.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "1:761725954340:android:b61fa6cdb24afb79d8abb1",
    measurementId: "SEU_MEASUREMENT_ID"
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