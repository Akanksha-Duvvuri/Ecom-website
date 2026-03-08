// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE1yqCwMjrTwghWGzZkOvJcGmysFpl8JE",
  authDomain: "ecom-c5c00.firebaseapp.com",
  projectId: "ecom-c5c00",
  storageBucket: "ecom-c5c00.firebasestorage.app",
  messagingSenderId: "905124725081",
  appId: "1:905124725081:web:acf9dc655bfe6848f84c48",
  measurementId: "G-9DGG1ZSSVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);