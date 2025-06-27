
// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp, addDoc, where, limit, doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

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

// --- Interfaces ---

export interface LiveClass {
  id: string;
  title: string;
  scheduledAt: Timestamp;
  link: string;
}

export interface NewLiveClassData {
    title: string;
    link: string;
    scheduledAt: string; // ISO string from datetime-local input
}

export interface Notification {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
}

export interface NewNotificationData {
    title: string;
    content: string;
}

export interface ScholarshipApplicationData {
    id?: string;
    applicationNumber: string;
    uniqueId: string;
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

export interface StudentData {
    id?: string;
    name: string;
    fatherName?: string;
    class?: string;
    age?: number;
    address?: string;
    school?: string;
    photoUrl?: string; // as data URI
    createdAt: Timestamp;
}

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

export interface AppConfig {
    scholarshipDeadline?: Timestamp;
    examDate?: Timestamp;
    admitCardDownloadStartDate?: Timestamp;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: Timestamp;
}

export interface CurrentAffair {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
}

export interface VideoLecture {
    id: string;
    title: string;
    videoUrl: string;
    createdAt: Timestamp;
}

export interface Download {
    id: string;
    title: string;
    pdfUrl: string;
    createdAt: Timestamp;
}

export interface EBook {
    id: string;
    title: string;
    pdfUrl: string;
    imageUrl?: string;
    createdAt: Timestamp;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: Timestamp;
}

export interface Teacher {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    createdAt: Timestamp;
}

export interface GalleryImage {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: Timestamp;
}

export interface ContactInquiry {
    id: string;
    email: string;
    mobile: string;
    createdAt: Timestamp;
}


// --- Constants ---
export const CLASS_UNIQUE_IDS: Record<string, string> = {
    "5": "8824",
    "6": "7456",
    "7": "80235",
    "8": "0080",
    "9": "4734",
};

// --- Functions ---

// Generic delete function
async function deleteDocument(collectionName: string, id: string): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await deleteDoc(doc(db, collectionName, id));
}

// Generic get all function
async function getAll<T>(collectionName: string): Promise<T[]> {
    if (!db) return [];
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
}

export async function getAppConfig(): Promise<AppConfig> {
    if (!db) return {};
    const configRef = doc(db, "appConfig", "settings");
    const docSnap = await getDoc(configRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppConfig;
    }
    return {};
}

export async function updateAppConfig(data: Partial<AppConfig>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const configRef = doc(db, "appConfig", "settings");
    await setDoc(configRef, data, { merge: true });
}

export async function addLiveClass({ title, link, scheduledAt }: NewLiveClassData): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "liveClasses"), {
        title,
        link,
        scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
    });
}
export const deleteLiveClass = (id: string) => deleteDocument("liveClasses", id);


export async function addNotification({ title, content }: NewNotificationData): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "notifications"), {
        title,
        content,
        createdAt: Timestamp.now(),
    });
}
export const deleteNotification = (id: string) => deleteDocument("notifications", id);

export async function addScholarshipApplication(data: Omit<ScholarshipApplicationData, 'createdAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "scholarshipApplications"), {
        ...data,
        createdAt: Timestamp.now(),
    });
}

export async function getScholarshipApplications(): Promise<ScholarshipApplicationData[]> {
    return getAll<ScholarshipApplicationData>("scholarshipApplications");
}

export async function getScholarshipApplicationByNumber(appNumber: string, uniqueId: string): Promise<ScholarshipApplicationData | null> {
    if (!db) return null;
    const q = query(
        collection(db, "scholarshipApplications"), 
        where("applicationNumber", "==", appNumber),
        where("uniqueId", "==", uniqueId),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ScholarshipApplicationData;
}

export async function addStudent(name: string): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const studentRef = doc(db, "students", name);
    const docSnap = await getDoc(studentRef);
    if (!docSnap.exists()) {
        await setDoc(studentRef, {
            name: name,
            createdAt: Timestamp.now(),
        });
    }
}

export async function getStudent(name: string): Promise<StudentData | null> {
    if (!db) return null;
    const studentRef = doc(db, "students", name);
    const docSnap = await getDoc(studentRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StudentData;
    }
    return null;
}

export async function updateStudent(name: string, data: Partial<Omit<StudentData, 'id' | 'createdAt'>>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const studentRef = doc(db, "students", name);
    await updateDoc(studentRef, data);
}

export async function getStudents(): Promise<StudentData[]> {
    return getAll<StudentData>("students");
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
    const q = query(collection(db, "testResults"), orderBy("percentage", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResultData));
}

export async function getLiveClasses(): Promise<LiveClass[]> {
  if (!db) return [];
  const q = query(collection(db, "liveClasses"), orderBy("scheduledAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as LiveClass[];
}

export async function getNotifications(): Promise<Notification[]> {
    return getAll<Notification>("notifications");
}

// --- Daily Posts ---
export const addPost = async (data: Omit<Post, 'id' | 'createdAt'>) => addDoc(collection(db, "posts"), { ...data, createdAt: Timestamp.now() });
export const getPosts = async (): Promise<Post[]> => getAll<Post>("posts");
export const deletePost = (id: string) => deleteDocument("posts", id);

// --- Current Affairs ---
export const addCurrentAffair = async (data: Omit<CurrentAffair, 'id' | 'createdAt'>) => addDoc(collection(db, "currentAffairs"), { ...data, createdAt: Timestamp.now() });
export const getCurrentAffairs = async (): Promise<CurrentAffair[]> => getAll<CurrentAffair>("currentAffairs");
export const deleteCurrentAffair = (id: string) => deleteDocument("currentAffairs", id);

// --- Video Lectures ---
export const addVideoLecture = async (data: Omit<VideoLecture, 'id' | 'createdAt'>) => addDoc(collection(db, "videoLectures"), { ...data, createdAt: Timestamp.now() });
export const getVideoLectures = async (): Promise<VideoLecture[]> => getAll<VideoLecture>("videoLectures");
export const deleteVideoLecture = (id: string) => deleteDocument("videoLectures", id);

// --- Downloads ---
export const addDownload = async (data: Omit<Download, 'id' | 'createdAt'>) => addDoc(collection(db, "downloads"), { ...data, createdAt: Timestamp.now() });
export const getDownloads = async (): Promise<Download[]> => getAll<Download>("downloads");
export const deleteDownload = (id: string) => deleteDocument("downloads", id);

// --- E-Books ---
export const addEBook = async (data: Omit<EBook, 'id' | 'createdAt'>) => addDoc(collection(db, "ebooks"), { ...data, createdAt: Timestamp.now() });
export const getEBooks = async (): Promise<EBook[]> => getAll<EBook>("ebooks");
export const deleteEBook = (id: string) => deleteDocument("ebooks", id);

// --- Courses ---
export const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => addDoc(collection(db, "courses"), { ...data, createdAt: Timestamp.now() });
export const getCourses = async (): Promise<Course[]> => getAll<Course>("courses");
export const deleteCourse = (id: string) => deleteDocument("courses", id);

// --- Teachers ---
export const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt'>) => addDoc(collection(db, "teachers"), { ...data, createdAt: Timestamp.now() });
export const getTeachers = async (): Promise<Teacher[]> => getAll<Teacher>("teachers");
export const deleteTeacher = (id: string) => deleteDocument("teachers", id);

// --- Gallery Images ---
export const addGalleryImage = async (data: Omit<GalleryImage, 'id' | 'createdAt'>) => addDoc(collection(db, "galleryImages"), { ...data, createdAt: Timestamp.now() });
export const getGalleryImages = async (): Promise<GalleryImage[]> => getAll<GalleryImage>("galleryImages");
export const deleteGalleryImage = (id: string) => deleteDocument("galleryImages", id);

// --- Contact Inquiries ---
export const addContactInquiry = async (data: Omit<ContactInquiry, 'id' | 'createdAt'>) => addDoc(collection(db, "contactInquiries"), { ...data, createdAt: Timestamp.now() });
export const getContactInquiries = async (): Promise<ContactInquiry[]> => getAll<ContactInquiry>("contactInquiries");

export { app, db };
