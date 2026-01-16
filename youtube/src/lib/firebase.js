// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL3Wt9lgEv0MsCpOM5E2mAIghYR0xRr2E",
  authDomain: "fir-f6eac.firebaseapp.com",
  projectId: "fir-f6eac",
  storageBucket: "fir-f6eac.firebasestorage.app",
  messagingSenderId: "653111252651",
  appId: "1:653111252651:web:23c73f6448b58e00a989ee",
  measurementId: "G-WM33YPXBP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };