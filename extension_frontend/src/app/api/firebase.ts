// Firebase config and Firestore for CSC Extension
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDaG2yqXRpqbuw-5x8zsPthASTUM7fhzyE',
  authDomain: 'csc-extension.firebaseapp.com',
  projectId: 'csc-extension',
  storageBucket: 'csc-extension.firebasestorage.app',
  messagingSenderId: '680240576448',
  appId: '1:680240576448:web:2e6e0e2256a02644333a25',
  measurementId: 'G-10ZT53MS1V',
};

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseApp() {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getFirestoreDb() {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}
