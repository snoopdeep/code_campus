// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { process_params } from "express/lib/router";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blogapplication-33873.firebaseapp.com",
  projectId: "blogapplication-33873",
  storageBucket: "blogapplication-33873.appspot.com",
  messagingSenderId: "789577066803",
  appId: "1:789577066803:web:615f8d4a934046d9873646",
  measurementId: "G-5M9DH1C8EP"
};

// Initialize Firebase and export it for use in other files
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);