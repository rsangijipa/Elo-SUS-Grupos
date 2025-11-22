import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🚨 PASTE YOUR FIREBASE KEYS HERE 🚨
// const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "elosus-grupos.firebaseapp.com",
//   projectId: "elosus-grupos",
//   storageBucket: "elosus-grupos.appspot.com",
//   messagingSenderId: "...",
//   appId: "..."
// };

// Use environment variables if available, otherwise fall back to placeholders (or empty)
// Use environment variables if available, otherwise fall back to placeholders (or empty)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB0vR_uVzadv3Ppjj0GNqXjOFuQKnP6fgk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "elosusgrupos.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "elosusgrupos",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "elosusgrupos.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "257423216168",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:257423216168:web:370b3675515bf2a8f86f1d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistence to prevent logout on refresh
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Firebase Persistence Error:", error);
    });

export { auth, db };
