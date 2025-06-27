// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp, addDoc } from "firebase/firestore";

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: "AIzaSyCVyBoofvGBEpI-HM5Z7iIXVwstOTKnHzQ",
  authDomain: "studio-6ppyt.firebaseapp.com",
  projectId: "studio-6ppyt",
  storageBucket: "studio-6ppyt.firebasestorage.app",
  messagingSenderId: "783387760146",
  appId: "1:783387760146:web:ef987dfc8af6a19354eacb",
  measurementId: "G-HL4DFRFFHV"
};

let app: FirebaseApp;
let db: Firestore;

function initializeFirebase() {
    if (firebaseConfig.projectId) {
        if (getApps().length) {
            app = getApps()[0];
        } else {
            app = initializeApp(firebaseConfig);
        }
        db = getFirestore(app);
    }
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
export async function addLiveClass({ title, link, scheduledAt }: NewLiveClassData): Promise<void> {
    if (!db) {
        throw new Error("Firestore DB not initialized.");
    }
    try {
        await addDoc(collection(db, "liveClasses"), {
            title: title,
            link: link,
            scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
        });
    } catch (error) {
        console.error("Error adding live class to Firestore:", error);
        throw error;
    }
}

// Function to add a new notification to Firestore
export async function addNotification({ title, content }: NewNotificationData): Promise<void> {
    if (!db) {
        throw new Error("Firestore DB not initialized.");
    }
    try {
        await addDoc(collection(db, "notifications"), {
            title: title,
            content: content,
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
