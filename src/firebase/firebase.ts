import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcIAyCx_S0HCY4V5R4Pd9M-rnVRta4hAw",
  authDomain: "tapps-dev.firebaseapp.com",
  projectId: "tapps-dev",
  storageBucket: "tapps-dev.appspot.com",
  messagingSenderId: "612246217342",
  appId: "1:612246217342:web:eb850696e5cc5bda906e2f",
  measurementId: "G-6JJG36TM2W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
