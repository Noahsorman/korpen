// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCV_F5Z-kV5f5evu9jql42XDnAYAk0YEj0",
  authDomain: "korpen-40f5a.firebaseapp.com",
  projectId: "korpen-40f5a",
  storageBucket: "korpen-40f5a.firebasestorage.app",
  messagingSenderId: "507117358985",
  appId: "1:507117358985:web:9e324d29bf9a6c139b9b58",
  measurementId: "G-KFQ8VG5M66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();