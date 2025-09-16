// firebaseConfig.web.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyABLJojY_8gqKMJif0rsY6uxvkCEI7uGIo",
    authDomain: "espacomelu.firebaseapp.com",
    databaseURL: "https://espacomelu-default-rtdb.firebaseio.com",
    projectId: "espacomelu",
    storageBucket: "espacomelu.firebasestorage.app",
    messagingSenderId: "90966792541",
    appId: "1:90966792541:web:d9421a5b0af0c1b0c6b0b4",
    measurementId: "G-GZF63LTZGN"
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

const app = getApps().find(app => app.name === 'principal') || initializeApp(firebaseConfig, 'principal');
const adminApp = getApps().find(app => app.name === 'admin') || initializeApp(firebaseConfigAdmin, 'admin');

const database = getDatabase(app);
const adminDatabase = getDatabase(adminApp);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, database, adminDatabase, googleProvider, app, storage, adminApp };