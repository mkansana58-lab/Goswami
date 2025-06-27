// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp } from "firebase/firestore";
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

function initializeFirebase() {
    if (getApps().length) {
        console.log("Firebase using existing app instance.");
        app = getApps()[0];
    } else {
        console.log("Initializing new Firebase app instance.");
        app = initializeApp(firebaseConfig);
    }
    db = getFirestore(app);
    auth = getAuth(app);
    if (typeof window !== "undefined") {
      isSupported().then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    }
}

// Ensure Firebase is initialized
initializeFirebase();

// Define the type for a live class document
export interface LiveClass {
  id: string;
  title: string;
  scheduledAt: Timestamp;
  link: string;
}

// Function to fetch live classes from Firestore
export async function getLiveClasses(): Promise<LiveClass[]> {
  if (!db) {
    console.error("Firestore DB not initialized. Cannot fetch live classes.");
    return [];
  }
  try {
    const liveClassesCollection = collection(db, "liveClasses");
    const q = query(liveClassesCollection, orderBy("scheduledAt", "desc"));
    const querySnapshot = await getDocs(q);
    const classes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LiveClass[];
    return classes;
  } catch (error) {
    console.error("Error fetching live classes from Firestore:", error);
    return [];
  }
}

export { app, db, auth, analytics };
