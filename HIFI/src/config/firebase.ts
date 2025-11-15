// Generated with assistance from Claude AI (Anthropic) - Nov 5, 2024

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB8sHm6N3jOWL2GR-0XGmshR8_i5G1q1hY",
  authDomain: "tonify-app.firebaseapp.com",
  databaseURL: "https://tonify-app-default-rtdb.firebaseio.com",
  projectId: "tonify-app",
  storageBucket: "tonify-app.firebasestorage.app",
  messagingSenderId: "558445836203",
  appId: "1:558445836203:web:4daf5b4d84914846fac4ee",
  measurementId: "G-FD37GC3FMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
