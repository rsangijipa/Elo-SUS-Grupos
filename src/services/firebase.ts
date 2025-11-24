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
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
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
