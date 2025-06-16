
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

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
    'Firebase Error: Essential Firebase configuration (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or undefined in your environment variables. Please check your .env file and ensure these variables are correctly set. Firebase will not be initialized properly, and app features may fail.'
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
      console.error("Firebase Error: Error initializing Firebase app:", error);
      // If app initialization fails, subsequent services will also fail to initialize.
    }
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore and Auth only if app was successfully initialized
  // @ts-ignore (app might be uninitialized if config is missing, but the outer check handles this)
  if (app) {
    // @ts-ignore
    db = getFirestore(app);
    // @ts-ignore
    auth = getAuth(app);

    // Initialize Analytics only on the client side and if measurementId is available and Analytics is supported
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) {
          try {
            // @ts-ignore
            analytics = getAnalytics(app);
          } catch (e) {
            console.warn("Firebase Warning: Firebase Analytics could not be initialized. Ensure measurementId is correct and Analytics is enabled for your project.", e);
          }
        } else {
          console.warn("Firebase Warning: Firebase Analytics is not supported in this environment.");
        }
      }).catch(e => {
        console.warn("Firebase Warning: Error checking Analytics support.", e);
      });
    } else if (typeof window !== 'undefined' && !firebaseConfig.measurementId) {
        console.warn("Firebase Warning: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is not set. Firebase Analytics will not be initialized.");
    }
  }
}

// Export the Firebase services.
// Note: They might be uninitialized if essential config was missing or app initialization failed.
export { app, db, auth, analytics };

