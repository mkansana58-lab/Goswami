
// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp } from "firebase/firestore"; // Added Timestamp
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
if (typeof window !== 'undefined') { // Only log on client-side
    console.log("Firebase Config Initializing with (client-side):");
    console.log("API Key:", firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 5) + "..." : "MISSING_IN_ENV");
    console.log("Auth Domain:", firebaseConfig.authDomain || "MISSING_IN_ENV");
    console.log("Project ID:", firebaseConfig.projectId || "MISSING_IN_ENV");
}


if (!getApps().length) {
  let missingConfigOnClient = false;
  if (typeof window !== 'undefined') { // Check only on client for NEXT_PUBLIC_
    missingConfigOnClient = logMissingConfig("NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey) || missingConfigOnClient;
    missingConfigOnClient = logMissingConfig("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain) || missingConfigOnClient;
    missingConfigOnClient = logMissingConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId) || missingConfigOnClient;
  }


  if (missingConfigOnClient) {
    console.error("CRITICAL: Firebase client-side configuration is missing essential NEXT_PUBLIC_ prefixed values. Firebase will not initialize correctly on the client. Please check your .env file and restart the server.");
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
  db = getFirestore(app); 
  auth = getAuth(app);    
  if (typeof window !== "undefined") {
      isSupported().then(supported => {
        if (supported && !analytics) { 
          analytics = getAnalytics(app);
          console.log("Firebase Analytics re-initialized (existing app instance).");
        }
      });
    }
  console.log("Firebase using existing app instance.");
}

interface LiveClassForFirebaseTs {
  id: string;
  title?: string;
  scheduledAt?: Timestamp;
  link?: string;
  [key: string]: any;
}

// Firestore से Live Classes लाने वाला function
export async function getLiveClasses(): Promise<LiveClassForFirebaseTs[]> {
  if (!db) {
    console.error("Firebase DB not initialized in getLiveClasses. Check Firebase configuration and server restart.");
    return [];
  }
  try {
    const liveClassesCollection = collection(db, "liveClasses");
    const q = query(liveClassesCollection, orderBy("scheduledAt", "desc"));
    const querySnapshot = await getDocs(q);
    const classes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LiveClassForFirebaseTs[];
    console.log("getLiveClasses in firebase.ts fetched:", classes.length, "items.");
    return classes;
  } catch (error) {
    console.error("Error fetching live classes from Firebase in getLiveClasses:", error);
    return [];
  }
}

export { app, db, auth, analytics };

    