
// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";

// Firebase configuration from environment variables
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

// Helper function to log missing config
function logMissingConfig(key: string, value: string | undefined) {
  if (!value) {
    console.warn(`Firebase config value for "${key}" is missing. Check your .env file and ensure it's prefixed with NEXT_PUBLIC_ if used on the client side.`);
    return true;
  }
  return false;
}

// Log the config values being used (for debugging)
console.log("Firebase Config Initializing with:");
console.log("API Key:", firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 5) + "..." : "MISSING");
console.log("Auth Domain:", firebaseConfig.authDomain || "MISSING");
console.log("Project ID:", firebaseConfig.projectId || "MISSING");


if (!getApps().length) {
  let missingConfig = false;
  missingConfig = logMissingConfig("NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey) || missingConfig;
  missingConfig = logMissingConfig("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain) || missingConfig;
  missingConfig = logMissingConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId) || missingConfig;
  // Add checks for other essential keys if needed

  if (missingConfig) {
    console.error("CRITICAL: Firebase configuration is missing essential values. Firebase will not initialize correctly. Please check your .env file and restart the server.");
    // You might want to throw an error here or handle it in a way that stops app execution
    // if Firebase is absolutely critical for the app to start.
    // For now, it will attempt to initialize, likely failing if core values are missing.
  }
  
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    if (typeof window !== "undefined") {
      isSupported().then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("Firebase Analytics initialized.");
        } else {
          console.log("Firebase Analytics is not supported in this environment.");
        }
      });
    }
    console.log("Firebase initialized successfully.");
  } catch (e) {
    console.error("Error initializing Firebase:", e);
    console.error("Ensure your .env file is correctly set up with NEXT_PUBLIC_ prefixed variables and that you have restarted your development server after changes.");
  }
} else {
  app = getApps()[0];
  db = getFirestore(app); // Ensure db is assigned here too
  auth = getAuth(app);    // Ensure auth is assigned here too
  if (typeof window !== "undefined") {
      isSupported().then(supported => {
        if (supported && !analytics) { // Initialize only if not already initialized
          analytics = getAnalytics(app);
          console.log("Firebase Analytics re-initialized (existing app instance).");
        }
      });
    }
  console.log("Firebase using existing app instance.");
}

// Firestore से Live Classes लाने वाला function
export async function getLiveClasses() {
  if (!db) {
    console.error("Firebase DB not initialized in getLiveClasses. Check Firebase configuration and server restart.");
    return [];
  }
  try {
    // 'liveClasses' कलेक्शन से डेटा लाएं और 'scheduledAt' के अनुसार घटते क्रम में (नई क्लास पहले)
    const liveClassesCollection = collection(db, "liveClasses");
    const q = query(liveClassesCollection, orderBy("scheduledAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching live classes from Firebase:", error);
    return [];
  }
}

export { app, db, auth, analytics };
