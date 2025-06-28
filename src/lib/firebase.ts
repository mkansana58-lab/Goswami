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

export type NotificationCategory = 'general' | 'news' | 'result' | 'scholarship' | 'alert';
export interface Notification {
    id: string;
    title: string;
    content: string;
    category: NotificationCategory;
    createdAt: Timestamp;
}

export interface NewNotificationData {
    title: string;
    content: string;
    category: NotificationCategory;
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
    isUniqueIdWaived?: boolean; // New field
    createdAt: Timestamp;
}

export interface StudentData {
    id?: string;
    name: string;
    password?: string; // Not stored, just for schema type
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
    splashImageUrl?: string;
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
    imageUrl?: string; // Added field
    createdAt: Timestamp;
}

export interface ChatMessage {
    id: string;
    text: string;
    userName: string;
    userPhotoUrl?: string;
    imageUrl?: string;
    createdAt: Timestamp;
}

export interface CustomTest {
    id: string;
    title: string;
    description: string;
    medium: string;
    languageForAI: string;
    timeLimit: number;
    totalQuestions: number;
    testType: 'custom';
    questions: Array<{
        id: number;
        question: string;
        options: string[];
        answer: string;
    }>;
    createdAt: Timestamp;
}

export interface TestSetting {
    id?: string; // testId
    isEnabled: boolean;
}

export interface TestEnrollment {
    id: string;
    studentName: string;
    testId: string;
    testName: string;
    enrollmentCode: string;
    enrolledAt: Timestamp;
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

// Notification helper
async function sendNotification(title: string, content: string, category: NotificationCategory = 'alert'): Promise<void> {
    if (!db) return;
    try {
        await addDoc(collection(db, "notifications"), {
            title,
            content,
            category,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

// Generic delete function
async function deleteDocument(collectionName: string, id: string): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await deleteDoc(doc(db, collectionName, id));
    await sendNotification(`Content Deleted`, `An item was removed from ${collectionName}.`, 'alert');
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
    await sendNotification('Academy Settings Updated', 'Key dates like deadlines or exam dates have been changed.', 'alert');
}

export async function addLiveClass({ title, link, scheduledAt }: NewLiveClassData): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "liveClasses"), {
        title,
        link,
        scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
        createdAt: Timestamp.now(),
    });
    await sendNotification('New Live Class', `A new live class "${title}" has been scheduled.`, 'general');
}
export const deleteLiveClass = (id: string) => deleteDocument("liveClasses", id);


export async function addNotification({ title, content, category }: NewNotificationData): Promise<void> {
    await sendNotification(title, content, category);
}
export const deleteNotification = (id: string) => deleteDocument("notifications", id);

export async function addScholarshipApplication(data: Omit<ScholarshipApplicationData, 'createdAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "scholarshipApplications"), {
        ...data,
        createdAt: Timestamp.now(),
    });
    await sendNotification('New Scholarship Application', `${data.fullName} has applied. App No: ${data.applicationNumber}`, 'scholarship');
}

export async function updateScholarshipApplicationWaiver(appId: string, isWaived: boolean): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const appRef = doc(db, "scholarshipApplications", appId);
    await updateDoc(appRef, { isUniqueIdWaived: isWaived });
}


export async function getScholarshipApplications(): Promise<ScholarshipApplicationData[]> {
    return getAll<ScholarshipApplicationData>("scholarshipApplications");
}

export async function getScholarshipApplicationByAppNumber(appNumber: string): Promise<ScholarshipApplicationData | null> {
    if (!db) return null;
    const q = query(
        collection(db, "scholarshipApplications"), 
        where("applicationNumber", "==", appNumber),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ScholarshipApplicationData;
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
    await sendNotification(`Test Result: ${data.studentName}`, `${data.studentName} scored ${data.score}/${data.totalQuestions} in the test "${data.testName}".`, 'result');
}

export async function getTestResults(): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(collection(db, "testResults"), orderBy("percentage", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResultData));
}

export async function getTestResultsForStudentByTest(studentName: string, testId: string): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(
        collection(db, "testResults"),
        where("studentName", "==", studentName),
        where("testId", "==", testId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestResultData);
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
export const addPost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "posts"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Daily Post', `A new post titled "${data.title}" has been published.`, 'news');
};
export const getPosts = async (): Promise<Post[]> => getAll<Post>("posts");
export const deletePost = (id: string) => deleteDocument("posts", id);

// --- Current Affairs ---
export const addCurrentAffair = async (data: Omit<CurrentAffair, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "currentAffairs"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Current Affair', `An update on "${data.title}" has been added.`, 'news');
};
export const getCurrentAffairs = async (): Promise<CurrentAffair[]> => getAll<CurrentAffair>("currentAffairs");
export const deleteCurrentAffair = (id: string) => deleteDocument("currentAffairs", id);

// --- Video Lectures ---
export const addVideoLecture = async (data: Omit<VideoLecture, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "videoLectures"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Video Lecture', `A new video lecture "${data.title}" is now available.`, 'general');
};
export const getVideoLectures = async (): Promise<VideoLecture[]> => getAll<VideoLecture>("videoLectures");
export const deleteVideoLecture = (id: string) => deleteDocument("videoLectures", id);

// --- Downloads ---
export const addDownload = async (data: Omit<Download, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "downloads"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Download Available', `"${data.title}" has been added to the downloads section.`, 'general');
};
export const getDownloads = async (): Promise<Download[]> => getAll<Download>("downloads");
export const deleteDownload = (id: string) => deleteDocument("downloads", id);

// --- E-Books ---
export const addEBook = async (data: Omit<EBook, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "ebooks"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New E-Book Added', `The e-book "${data.title}" is now available to read.`, 'general');
};
export const getEBooks = async (): Promise<EBook[]> => getAll<EBook>("ebooks");
export const deleteEBook = (id: string) => deleteDocument("ebooks", id);

// --- Courses ---
export const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "courses"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Course Available', `"${data.title}" course has been added.`, 'general');
};
export const getCourses = async (): Promise<Course[]> => getAll<Course>("courses");
export const deleteCourse = (id: string) => deleteDocument("courses", id);

// --- Teachers ---
export const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "teachers"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Teacher Profile', `Added ${data.name} to the faculty list.`, 'general');
};
export const getTeachers = async (): Promise<Teacher[]> => getAll<Teacher>("teachers");
export const deleteTeacher = (id: string) => deleteDocument("teachers", id);

// --- Gallery Images ---
export const addGalleryImage = async (data: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "galleryImages"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Gallery Image', `A new image with caption "${data.caption}" was added.`, 'general');
};
export const getGalleryImages = async (): Promise<GalleryImage[]> => getAll<GalleryImage>("galleryImages");
export const deleteGalleryImage = (id: string) => deleteDocument("galleryImages", id);

// --- Contact Inquiries ---
export const addContactInquiry = async (data: Omit<ContactInquiry, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "contactInquiries"), { ...data, createdAt: Timestamp.now() });
    await sendNotification('New Contact Inquiry', `You have a new message from ${data.email}.`, 'alert');
};
export const getContactInquiries = async (): Promise<ContactInquiry[]> => getAll<ContactInquiry>("contactInquiries");

// --- Chat Messages ---
export const addChatMessage = async (data: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "chatMessages"), { ...data, createdAt: Timestamp.now() });
};

// --- Custom Tests ---
export const addCustomTest = async (data: any) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    const questions = JSON.parse(data.questionsJson);
    const testData = {
        title: data.title,
        description: data.description,
        medium: data.medium,
        languageForAI: data.languageForAI,
        timeLimit: Number(data.timeLimit),
        totalQuestions: questions.length,
        testType: 'custom',
        questions: questions,
        createdAt: Timestamp.now()
    };
    const newTest = await addDoc(collection(db, "customTests"), testData);
    await sendNotification('New Custom Test', `A new test "${data.title}" has been created.`, 'general');
    return newTest;
};
export const getCustomTests = async (): Promise<CustomTest[]> => getAll<CustomTest>("customTests");
export const getCustomTest = async (id: string): Promise<CustomTest | null> => {
    if (!db) return null;
    const testRef = doc(db, "customTests", id);
    const docSnap = await getDoc(testRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CustomTest;
    }
    return null;
}
export const deleteCustomTest = (id: string) => deleteDocument("customTests", id);


// --- Test Settings ---
export const getTestSettings = async (): Promise<Record<string, TestSetting>> => {
    if (!db) return {};
    const settings: Record<string, TestSetting> = {};
    const querySnapshot = await getDocs(collection(db, "testSettings"));
    querySnapshot.forEach((doc) => {
        settings[doc.id] = { id: doc.id, ...doc.data() } as TestSetting;
    });
    return settings;
};

export const updateTestSetting = async (testId: string, isEnabled: boolean) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    const settingRef = doc(db, "testSettings", testId);
    await setDoc(settingRef, { isEnabled: isEnabled }, { merge: true });
};

// --- Test Enrollments ---
const ID_WORDS = [
  'Apple', 'Ball', 'Cat', 'Dog', 'Eagle', 'Fox', 'Goat', 'Horse', 'Ink', 'Jam', 'Kite', 'Lion', 'Mango', 'Nest', 'Orange', 
  'Pen', 'Queen', 'Rose', 'Sun', 'Tiger', 'Urdu', 'Van', 'Watch', 'Xray', 'Yak', 'Zebra', 'Cloud', 'River', 'Star', 'Moon'
];
function generateEnrollmentCode(): string {
  const codeWords = [];
  for (let i = 0; i < 5; i++) {
    codeWords.push(ID_WORDS[Math.floor(Math.random() * ID_WORDS.length)]);
  }
  return codeWords.join('-');
}


export const addTestEnrollment = async (studentName: string, testId: string, testName: string): Promise<string> => {
    if (!db) throw new Error("Firestore DB not initialized.");
    // Check if already enrolled to prevent duplicates
    const q = query(collection(db, "testEnrollments"), where("studentName", "==", studentName), where("testId", "==", testId));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
        return existing.docs[0].data().enrollmentCode;
    }

    const enrollmentCode = generateEnrollmentCode();
    await addDoc(collection(db, "testEnrollments"), {
        studentName,
        testId,
        testName,
        enrollmentCode,
        enrolledAt: Timestamp.now(),
    });

    await sendNotification(
        'Test Enrollment Successful', 
        `You have enrolled in "${testName}". Your Enrollment Code is: ${enrollmentCode}. Please save this code.`, 
        'general'
    );
    return enrollmentCode;
};

export const getEnrollmentsForStudent = async (studentName: string): Promise<TestEnrollment[]> => {
    if (!db) return [];
    const q = query(collection(db, "testEnrollments"), where("studentName", "==", studentName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestEnrollment);
};

export const getTestEnrollments = async (): Promise<TestEnrollment[]> => {
    return getAll<TestEnrollment>("testEnrollments");
};


export { app, db };
