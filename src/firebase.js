// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDseN7ym0TuKNUXgdZ9ziWeO-LCYAWEzHw",
  authDomain: "employee-management-syst-efd3d.firebaseapp.com",
  projectId: "employee-management-syst-efd3d",
  storageBucket: "employee-management-syst-efd3d.appspot.com",
  messagingSenderId: "853361843275",
  appId: "1:853361843275:web:7edcc2c80f479ae6b201ce",
  measurementId: "G-QRYJG4BMYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage};