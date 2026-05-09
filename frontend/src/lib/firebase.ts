import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missingFirebaseEnv = !firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId;
const missingFirebaseEnvMessage =
  "Firebase auth is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID to the frontend Vercel project.";

let app;
if (!missingFirebaseEnv) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  if (typeof window !== "undefined") {
    console.error(missingFirebaseEnvMessage);
  }
}

const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, missingFirebaseEnv, missingFirebaseEnvMessage };
