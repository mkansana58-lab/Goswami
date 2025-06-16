
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

// Log the values being read from environment variables for easier debugging
console.log("Firebase Config Check: API Key from env:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Firebase Config Check: Auth Domain from env:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("Firebase Config Check: Project ID from env:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("Firebase Config Check: Measurement ID from env:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);


let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | undefined;

// Check for essential Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    'CRITICAL Firebase Error: Essential Firebase configuration (API_KEY, AUTH_DOMAIN, PROJECT_ID) is MISSING or UNDEFINED in your environment variables. \n' +
    '1. Please VERIFY your .env file has the correct NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID values from your Firebase project settings. \n' +
    '2. Ensure your variable names start with NEXT_PUBLIC_ for client-side access. \n' +
    '3. Ensure you have RESTARTED your Next.js development server after any .env file changes. \n' +
    'Firebase will NOT be initialized properly, and app features will FAIL.'
  );
  // app, db, auth, analytics will remain uninitialized here.
  // Code that relies on them being initialized will likely throw errors,
  // which serves as an indicator of this configuration issue.
} else {
  // Initialize Firebase App
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase App initialized successfully.");
    } catch (error) {
      console.error("Firebase Error: Error initializing Firebase app:", error);
      // If app initialization fails, subsequent services will also fail to initialize.
    }
  } else {
    app = getApps()[0];
    console.log("Firebase App already initialized.");
  }

  // Initialize Firestore and Auth only if app was successfully initialized
  // @ts-ignore 
  if (app) {
    // @ts-ignore
    db = getFirestore(app);
    // @ts-ignore
    auth = getAuth(app);
    console.log("Firestore and Auth initialized.");

    // Initialize Analytics only on the client side and if measurementId is available and Analytics is supported
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) {
          try {
            // @ts-ignore
            analytics = getAnalytics(app);
            console.log("Firebase Analytics initialized.");
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
  } else {
     console.error("Firebase Error: App object is not available, so Firestore, Auth, and Analytics cannot be initialized.");
  }
}

// Export the Firebase services.
// Note: They might be uninitialized if essential config was missing or app initialization failed.
export { app, db, auth, analytics };
