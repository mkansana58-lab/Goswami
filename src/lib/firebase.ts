
// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp, addDoc } from "firebase/firestore";

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

function initializeFirebase() {
    if (getApps().length) {
        app = getApps()[0];
    } else {
        app = initializeApp(firebaseConfig);
    }
    db = getFirestore(app);
}

// Ensure Firebase is initialized
initializeFirebase();

// Live Class types
export interface LiveClass {
  id: string;
  title: string;
  scheduledAt: Timestamp;
  link: string;
}

interface NewLiveClassData {
    title: string;
    link: string;
    scheduledAt: string; // ISO string from datetime-local input
}

// Notification types
export interface Notification {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
}

interface NewNotificationData {
    title: string;
    content: string;
}

// Function to add a new live class to Firestore
export async function addLiveClass(classData: NewLiveClassData): Promise<void> {
    if (!db) {
        throw new Error("Firestore DB not initialized.");
    }
    try {
        await addDoc(collection(db, "liveClasses"), {
            title: classData.title,
            link: classData.link,
            scheduledAt: Timestamp.fromDate(new Date(classData.scheduledAt)),
        });
    } catch (error) {
        console.error("Error adding live class to Firestore:", error);
        throw error;
    }
}

// Function to add a new notification to Firestore
export async function addNotification(notificationData: NewNotificationData): Promise<void> {
    if (!db) {
        throw new Error("Firestore DB not initialized.");
    }
    try {
        await addDoc(collection(db, "notifications"), {
            ...notificationData,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error adding notification to Firestore:", error);
        throw error;
    }
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

// Function to fetch notifications from Firestore
export async function getNotifications(): Promise<Notification[]> {
    if (!db) {
      console.error("Firestore DB not initialized. Cannot fetch notifications.");
      return [];
    }
    try {
      const notificationsCollection = collection(db, "notifications");
      const q = query(notificationsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications from Firestore:", error);
      return [];
    }
}


export { app, db };
