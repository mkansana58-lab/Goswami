
"use client";
// firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore, query, orderBy, Timestamp, addDoc, where, limit, doc, setDoc, getDoc, deleteDoc, updateDoc, increment, runTransaction } from "firebase/firestore";

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
    recipient?: string; // For user-specific notifications
}

export interface NewNotificationData {
    title: string;
    content: string;
    category: NotificationCategory;
    recipient?: string;
}

export interface ScholarshipApplicationData {
    id?: string;
    applicationNumber: string;
    rollNumber: string;
    fullName: string;
    fatherName: string;
    mobile: string;
    email: string;
    age: number;
    class: string;
    school: string;
    address: string;
    targetExam: string;
    targetTestEnrollmentCode?: string;
    testMode: 'online' | 'offline';
    photoUrl: string; // as data URI
    signatureUrl: string; // as data URI
    resultStatus?: 'pending' | 'pass' | 'fail';
    isPaymentVerified?: boolean;
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
    quizWinnings?: number;
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

export interface ScholarshipTestResult {
    id?: string;
    applicationNumber: string;
    studentName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timeTaken: number; // in seconds
    answers: Record<number, string>;
    allQuestions: Question[];
    targetTestEnrollmentCode?: string;
    submittedAt: Timestamp;
}

export interface AppConfig {
    scholarshipDeadline?: Timestamp;
    scholarshipTestStartDate?: Timestamp;
    scholarshipTestEndDate?: Timestamp;
    admitCardDownloadStartDate?: Timestamp;
    splashImageUrl?: string;
    cityIntimationSlipStartDate?: Timestamp;
    resultAnnouncementDate?: Timestamp;
    scholarshipTestId?: string;
    paymentQrCodeUrl?: string;
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
    message: string;
    imageUrl?: string;
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

export interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
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
    questions: Question[];
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
    attemptsWaived?: boolean;
    allowedAttempts: number;
}

// --- Helper Functions ---

// Generate a random numeric string of a given length
const generateRandomCode = (length: number) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)).toString();
};

// Notification helper - Only for student actions, not admin ones.
async function sendStudentNotification(title: string, content: string, category: NotificationCategory = 'alert', recipient?: string): Promise<void> {
    if (!db) return;
    try {
        const notificationData: any = {
            title,
            content,
            category,
            createdAt: Timestamp.now(),
        };
        if (recipient) {
            notificationData.recipient = recipient;
        }
        await addDoc(collection(db, "notifications"), notificationData);
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

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


// --- App-specific Functions ---

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
        createdAt: Timestamp.now(),
    });
}
export const deleteLiveClass = (id: string) => deleteDocument("liveClasses", id);


export async function addNotification({ title, content, category, recipient }: NewNotificationData): Promise<void> {
     if (!db) throw new Error("Firestore DB not initialized.");
     await addDoc(collection(db, "notifications"), { title, content, category, recipient, createdAt: Timestamp.now() });
}
export const deleteNotification = (id: string) => deleteDocument("notifications", id);

export async function addScholarshipApplication(data: Omit<ScholarshipApplicationData, 'createdAt' | 'id' | 'resultStatus' | 'applicationNumber' | 'rollNumber' | 'isPaymentVerified'>): Promise<{applicationNumber: string, rollNumber: string}> {
    if (!db) throw new Error("Firestore DB not initialized.");
    
    // Check for existing application with the same name and father's name to prevent duplicates
    const q = query(collection(db, "scholarshipApplications"), where("fullName", "==", data.fullName), where("fatherName", "==", data.fatherName));
    const existingSnapshot = await getDocs(q);
    if (!existingSnapshot.empty) {
        throw new Error("An application for this student already exists.");
    }

    const applicationNumber = `GSA${new Date().getFullYear()}${generateRandomCode(5)}`;
    const rollNumber = `R${generateRandomCode(8)}`;
    
    await addDoc(collection(db, "scholarshipApplications"), {
        ...data,
        applicationNumber,
        rollNumber,
        resultStatus: 'pending',
        isPaymentVerified: false,
        createdAt: Timestamp.now(),
    });
    
    sendStudentNotification('Application Received', `Your application for ${data.fullName} (App No: ${applicationNumber}) has been received.`, 'scholarship', data.fullName);

    return { applicationNumber, rollNumber };
}

export const deleteScholarshipApplication = (id: string) => deleteDocument("scholarshipApplications", id);

export async function updateScholarshipApplicationResultStatus(appId: string, status: 'pending' | 'pass' | 'fail'): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const appRef = doc(db, "scholarshipApplications", appId);
    await updateDoc(appRef, { resultStatus: status });
}

export async function updateScholarshipApplicationPaymentStatus(appId: string, isVerified: boolean): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const appRef = doc(db, "scholarshipApplications", appId);
    await updateDoc(appRef, { isPaymentVerified: isVerified });
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

export async function addQuizWinnings(studentName: string, amount: number): Promise<void> {
    if (!db || amount <= 0) return;
    const studentRef = doc(db, "students", studentName);
    await updateDoc(studentRef, {
        quizWinnings: increment(amount)
    });
}

export async function redeemWinningsForAttempts(studentName: string, enrollmentId: string, cost: number, attemptsToAdd: number): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    const studentRef = doc(db, "students", studentName);
    const enrollmentRef = doc(db, "testEnrollments", enrollmentId);

    await runTransaction(db, async (transaction) => {
        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists() || (studentDoc.data().quizWinnings || 0) < cost) {
            throw new Error("Insufficient winnings or student not found!");
        }
        transaction.update(studentRef, { quizWinnings: increment(-cost) });
        transaction.update(enrollmentRef, { allowedAttempts: increment(attemptsToAdd) });
    });
}

export async function getStudents(): Promise<StudentData[]> {
    return getAll<StudentData>("students");
}

export const deleteStudent = (id: string) => deleteDocument("students", id);

export async function addTestResult(data: Omit<TestResultData, 'submittedAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "testResults"), {
        ...data,
        submittedAt: Timestamp.now(),
    });
}

export async function addScholarshipTestResult(data: Omit<ScholarshipTestResult, 'submittedAt' | 'id'>): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "scholarshipTestResults"), {
        ...data,
        submittedAt: Timestamp.now(),
    });
}

export async function getScholarshipTestResultByAppNumber(appNumber: string): Promise<ScholarshipTestResult | null> {
    if (!db) return null;
    const q = query(
        collection(db, "scholarshipTestResults"),
        where("applicationNumber", "==", appNumber),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ScholarshipTestResult;
}

export async function getScholarshipTestResults(): Promise<ScholarshipTestResult[]> {
    if (!db) return [];
    const q = query(collection(db, "scholarshipTestResults"), orderBy("score", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ScholarshipTestResult);
}

export const deleteScholarshipTestResult = (id: string) => deleteDocument("scholarshipTestResults", id);


export async function getTestResults(): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(collection(db, "testResults"), orderBy("percentage", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestResultData);
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

export async function getTestResultsForStudent(studentName: string): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(
        collection(db, "testResults"),
        where("studentName", "==", studentName),
        orderBy("submittedAt", "desc")
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
};
export const getPosts = async (): Promise<Post[]> => getAll<Post>("posts");
export const deletePost = (id: string) => deleteDocument("posts", id);

// --- Current Affairs ---
export const addCurrentAffair = async (data: Omit<CurrentAffair, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "currentAffairs"), { ...data, createdAt: Timestamp.now() });
};
export const getCurrentAffairs = async (): Promise<CurrentAffair[]> => getAll<CurrentAffair>("currentAffairs");
export const deleteCurrentAffair = (id: string) => deleteDocument("currentAffairs", id);

// --- Video Lectures ---
export const addVideoLecture = async (data: Omit<VideoLecture, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "videoLectures"), { ...data, createdAt: Timestamp.now() });
};
export const getVideoLectures = async (): Promise<VideoLecture[]> => getAll<VideoLecture>("videoLectures");
export const deleteVideoLecture = (id: string) => deleteDocument("videoLectures", id);

// --- Downloads ---
export const addDownload = async (data: Omit<Download, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "downloads"), { ...data, createdAt: Timestamp.now() });
};
export const getDownloads = async (): Promise<Download[]> => getAll<Download>("downloads");
export const deleteDownload = (id: string) => deleteDocument("downloads", id);

// --- E-Books ---
export const addEBook = async (data: Omit<EBook, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "ebooks"), { ...data, createdAt: Timestamp.now() });
};
export const getEBooks = async (): Promise<EBook[]> => getAll<EBook>("ebooks");
export const deleteEBook = (id: string) => deleteDocument("ebooks", id);

// --- Courses ---
export const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "courses"), { ...data, createdAt: Timestamp.now() });
};
export const getCourses = async (): Promise<Course[]> => getAll<Course>("courses");
export const deleteCourse = (id: string) => deleteDocument("courses", id);

// --- Teachers ---
export const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "teachers"), { ...data, createdAt: Timestamp.now() });
};
export const getTeachers = async (): Promise<Teacher[]> => getAll<Teacher>("teachers");
export const deleteTeacher = (id: string) => deleteDocument("teachers", id);

// --- Gallery Images ---
export const addGalleryImage = async (data: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "galleryImages"), { ...data, createdAt: Timestamp.now() });
};
export const getGalleryImages = async (): Promise<GalleryImage[]> => getAll<GalleryImage>("galleryImages");
export const deleteGalleryImage = (id: string) => deleteDocument("galleryImages", id);

// --- Contact Inquiries ---
export const addContactInquiry = async (data: Omit<ContactInquiry, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "contactInquiries"), { ...data, createdAt: Timestamp.now() });
};
export const getContactInquiries = async (): Promise<ContactInquiry[]> => getAll<ContactInquiry>("contactInquiries");
export const deleteContactInquiry = (id: string) => deleteDocument("contactInquiries", id);


// --- Chat Messages ---
export const addChatMessage = async (data: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firestore DB not initialized.");
    await addDoc(collection(db, "chatMessages"), { ...data, createdAt: Timestamp.now() });
};

// --- Custom Tests ---
export const addCustomTest = async (data: any) => {
    if (!db) throw new Error("Firestore DB not initialized.");

    let questions: Question[];
    // Handle both JSON string and already-parsed array from visual builder
    if (typeof data.questionsJson === 'string') {
        questions = JSON.parse(data.questionsJson);
    } else {
        questions = data.questions.map((q: any, index: number) => ({ ...q, id: index + 1 }));
    }

    const testData: Omit<CustomTest, 'id' | 'createdAt'> = {
        title: data.title,
        description: data.description,
        medium: data.medium,
        languageForAI: data.languageForAI,
        timeLimit: Number(data.timeLimit),
        totalQuestions: questions.length,
        testType: 'custom',
        questions: questions,
    };
    await setDoc(doc(db, "customTests", data.id), { ...testData, createdAt: Timestamp.now() });
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
function generateEnrollmentCode(): string {
  return generateRandomCode(5);
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
        attemptsWaived: false,
        allowedAttempts: 2, // Default allowed attempts
    });

    sendStudentNotification(
        'Test Enrollment Successful', 
        `You have enrolled in "${testName}". Your unique 5-digit Enrollment Code is: ${enrollmentCode}. Please save this code.`, 
        'general',
        studentName // This makes the notification private to the student
    );
    return enrollmentCode;
};

export const deleteTestEnrollment = (id: string) => deleteDocument("testEnrollments", id);


export const updateTestEnrollmentWaiver = async (enrollmentId: string, isWaived: boolean): Promise<void> => {
    if (!db) throw new Error("Firestore DB not initialized.");
    const enrollmentRef = doc(db, "testEnrollments", enrollmentId);
    await updateDoc(enrollmentRef, { attemptsWaived: isWaived });
};

export async function updateEnrollmentAllowedAttempts(enrollmentId: string, attempts: number): Promise<void> {
    if (!db) throw new Error("Firestore DB not initialized.");
    if (attempts < 0) throw new Error("Attempts cannot be negative.");
    const enrollmentRef = doc(db, "testEnrollments", enrollmentId);
    await updateDoc(enrollmentRef, { allowedAttempts: attempts });
}

export const getEnrollmentsForStudent = async (studentName: string): Promise<TestEnrollment[]> => {
    if (!db) return [];
    const q = query(collection(db, "testEnrollments"), where("studentName", "==", studentName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestEnrollment);
};

export async function getTestEnrollments(): Promise<TestEnrollment[]> {
    if (!db) return [];
    const q = query(collection(db, "testEnrollments"), orderBy("enrolledAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TestEnrollment);
}

export { app, db };
