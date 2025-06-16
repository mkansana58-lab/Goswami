
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Configuration object using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | undefined;

// Check for essential Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    'Essential Firebase configuration (apiKey, authDomain, projectId) is missing. Firebase will not be initialized properly and app features may fail.'
  );
  // app, db, auth, analytics will remain uninitialized here.
  // Code that relies on them being initialized will likely throw errors,
  // which serves as an indicator of this configuration issue.
} else {
  // Initialize Firebase App
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      // If app initialization fails, subsequent services will also fail to initialize.
    }
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore and Auth only if app was successfully initialized
  if (app!) {
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Analytics only on the client side and if measurementId is available
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics could not be initialized. Ensure measurementId is correct.", e);
      }
    }
  }
}

// Export the Firebase services.
// Note: They might be uninitialized if essential config was missing or app initialization failed.
export { app, db, auth, analytics };
