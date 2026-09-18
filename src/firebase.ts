import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { FirestoreErrorInfo } from './types';

const env = ((import.meta as any).env || {}) as Record<string, string>;

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0189962209",
  appId: env.VITE_FIREBASE_APP_ID || "1:108335510952:web:4bca144da6050d1e9b199d",
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAxYWYngppQwMnvGr_cb2pmaVSU7zirHlY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0189962209.firebaseapp.com",
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || "ai-studio-329297ba-fdab-4efd-a8ad-b44e4f29cf39",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0189962209.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "108335510952"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Authentication failed", error);
    throw error;
  }
};

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'guest',
      email: user?.email || 'N/A',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || false,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })) || [],
    }
  };
  throw new Error(JSON.stringify(errorInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
