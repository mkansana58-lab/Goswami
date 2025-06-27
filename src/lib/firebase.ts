// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp, addDoc, where, limit } from "firebase/firestore";

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

// Scholarship Application interfaces
export interface ScholarshipApplicationData {
    id?: string;
    applicationNumber: string;
    fullName: string;
    fatherName: string;
    mobile: string;
    email: string;
    age: number;
    class: string;
    school: string;
    address: string;
    photoUrl: string; // as data URI
    signatureUrl: string; // as data URI
    createdAt: Timestamp;
}

// Student interface
export interface StudentData {
    id?: string;
    name: string;
    createdAt: Timestamp;
}

// Test Result interface
export interface TestResultData {
    id?: string;
    studentName: string;
    testId: string;
    testName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: Timestamp;
}

// Function to add a new live class to Firestore
export async function addLiveClass({ title, link, scheduledAt }: NewLiveClassData): Promise<void> {
    if (!db) {
        throw new Error("Firestore DB not initialized.");
    }
    try {
        await addDoc(collection(db, "liveClasses"), {
            title,
            link,
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
            title,
            content,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error adding notification to Firestore:", error);
        throw error;
    }
}

export async function addScholarshipApplication(data: Omit<ScholarshipApplicationData, 'createdAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    try {
        await addDoc(collection(db, "scholarshipApplications"), {
            ...data,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error adding scholarship application:", error);
        throw error;
    }
}

export async function getScholarshipApplications(): Promise<ScholarshipApplicationData[]> {
    if (!db) return [];
    const applicationsCollection = collection(db, "scholarshipApplications");
    const q = query(applicationsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScholarshipApplicationData));
}

export async function getScholarshipApplicationByNumber(appNumber: string, uniqueId: string): Promise<ScholarshipApplicationData | null> {
    if (!db) return null;
    const applicationsCollection = collection(db, "scholarshipApplications");
    const q = query(
        applicationsCollection, 
        where("applicationNumber", "==", appNumber),
        where("mobile", "==", uniqueId), // Using mobile as uniqueId for verification
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docData = querySnapshot.docs[0].data();
    return {
        id: querySnapshot.docs[0].id,
        ...docData
    } as ScholarshipApplicationData;
}


export async function addStudent(name: string): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const studentQuery = query(collection(db, "students"), where("name", "==", name), limit(1));
    const querySnapshot = await getDocs(studentQuery);
    if (querySnapshot.empty) {
        await addDoc(collection(db, "students"), {
            name: name,
            createdAt: Timestamp.now(),
        });
    }
}

export async function getStudents(): Promise<StudentData[]> {
    if (!db) return [];
    const studentsCollection = collection(db, "students");
    const q = query(studentsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as StudentData);
}

export async function addTestResult(data: Omit<TestResultData, 'submittedAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "testResults"), {
        ...data,
        submittedAt: Timestamp.now(),
    });
}

export async function getTestResults(): Promise<TestResultData[]> {
    if (!db) return [];
    const resultsCollection = collection(db, "testResults");
    const q = query(resultsCollection, orderBy("percentage", "desc"), limit(20)); // Get top 20
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestResultData);
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
