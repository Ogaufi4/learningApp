"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type User,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signOut,
} from "firebase/auth";

function requireFirebaseEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }

  return value;
}

function getFirebaseConfig() {
  return {
    apiKey: requireFirebaseEnv("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: requireFirebaseEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: requireFirebaseEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requireFirebaseEnv("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export function getFirebaseAuth() {
  const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  return getAuth(app);
}

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function onAuthStateChanged(callback: (authUser: User | null) => void) {
  return _onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(getFirebaseAuth(), createGoogleProvider());

    if (!result?.user) {
      throw new Error("Google sign in failed");
    }

    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function signOutWithGoogle() {
  try {
    await signOut(getFirebaseAuth());
  } catch (error) {
    console.error("Error signing out with Google", error);
    throw error;
  }
}
