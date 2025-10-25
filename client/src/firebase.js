// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "redux-auth-app-c0e94.firebaseapp.com",
  projectId: "redux-auth-app-c0e94",
  storageBucket: "redux-auth-app-c0e94.firebasestorage.app",
  messagingSenderId: "531545767689",
  appId: "1:531545767689:web:6dee137b8f39c6121a5dd8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
