import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB0vR_uVzadv3Ppjj0GNqXjOFuQKnP6fgk",
    authDomain: "elosusgrupos.firebaseapp.com",
    projectId: "elosusgrupos",
    storageBucket: "elosusgrupos.firebasestorage.app",
    messagingSenderId: "257423216168",
    appId: "1:257423216168:web:370b3675515bf2a8f86f1d",
    measurementId: "G-M5RBC7SH1X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
