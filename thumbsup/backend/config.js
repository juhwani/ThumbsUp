// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFr8xLMtbp6EBsvA9SyIye1tWSd5ixP9o",
  authDomain: "thumbsup-ee01c.firebaseapp.com",
  projectId: "thumbsup-ee01c",
  storageBucket: "thumbsup-ee01c.firebasestorage.app",
  messagingSenderId: "872310648279",
  appId: "1:872310648279:web:fb1ec0b47b268168ff6f92",
  measurementId: "G-1LMNFP4LRE"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Initialize analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {  // Check if we're on the client side
    analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, analytics, db };