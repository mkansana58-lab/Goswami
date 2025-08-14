
"use client";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    push, 
    update, 
    remove, 
    query, 
    orderByChild, 
    equalTo, 
    serverTimestamp,
    runTransaction,
    increment as rtIncrement
} from "firebase/database";

// This is a mock configuration. In a real app, this would be populated by the user.
export const firebaseConfig = {
  apiKey: "AIzaSyCVyBoofvGBEpI-HM5Z7iIXVwstOTKnHzQ",
  authDomain: "studio-6ppyt.firebaseapp.com",
  projectId: "studio-6ppyt",
  storageBucket: "studio-6ppyt.firebasestorage.app",
  messagingSenderId: "783387760146",
  appId: "1:783387760146:web:ef987dfc8af6a19354eacb",
  databaseURL: "https://studio-6ppyt-default-rtdb.firebaseio.com"
};

let app: FirebaseApp | undefined;
let db: ReturnType<typeof getDatabase> | undefined;

function getDb() {
    if (!firebaseConfig.databaseURL) {
        console.error("Firebase Realtime Database URL is not configured.");
        return;
    }
    if (!app) {
        app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    }
    if (!db) {
        db = getDatabase(app);
    }
    return db;
}
db = getDb();

export function timestampToDate(timestamp: number): Date {
    return new Date(timestamp);
}

// --- Interfaces ---

export interface LiveClass {
  id: string;
  title: string;
  scheduledAt: number; // Stored as Unix timestamp
  link?: string;
  embedCode?: string;
  createdAt: number;
}

export interface NewLiveClassData {
    title: string;
    scheduledAt: string; // ISO string
    link?: string;
    embedCode?: string;
}

export type NotificationCategory = 'general' | 'news' | 'result' | 'scholarship' | 'alert';
export interface Notification {
    id: string;
    title: string;
    content: string;
    category: NotificationCategory;
    createdAt: number;
    recipient?: string;
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
    photoUrl: string;
    signatureUrl: string;
    resultStatus?: 'pending' | 'pass' | 'fail';
    isPaymentVerified?: boolean;
    createdAt: number;
}

export interface StudentData {
    id?: string; // This will be the student's name (the key)
    name: string;
    fatherName?: string;
    class?: string;
    age?: number;
    address?: string;
    school?: string;
    photoUrl?: string;
    quizWinnings?: number;
    createdAt: number;
}

export interface TestResultData {
    id?: string;
    studentName: string;
    testId: string;
    testName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: number;
}

export interface ScholarshipTestResult {
    id?: string;
    applicationNumber: string;
    studentName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timeTaken: number;
    answers: Record<number, string>;
    allQuestions: Question[];
    targetTestEnrollmentCode?: string;
    submittedAt: number;
}

export interface AppConfig {
    scholarshipDeadline?: number;
    scholarshipTestStartDate?: number;
    scholarshipTestEndDate?: number;
    admitCardDownloadStartDate?: number;
    splashImageUrl?: string;
    cityIntimationSlipStartDate?: number;
    resultAnnouncementDate?: number;
    scholarshipTestId?: string;
    paymentQrCodeUrl?: string;
    festivalQuizBgUrl?: string;
    knowledgeBazaarBgUrl?: string;
    scienceGameBgUrl?: string;
    appTutorialEmbedCode?: string;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: number;
}

export interface CurrentAffair {
    id: string;
    title: string;
    content: string;
    createdAt: number;
}

export interface VideoLecture {
    id: string;
    title: string;
    videoUrl: string;
    createdAt: number;
}

export interface Download {
    id: string;
    title: string;
    pdfUrl: string;
    createdAt: number;
}

export interface EBook {
    id: string;
    title: string;
    pdfUrl: string;
    imageUrl?: string;
    createdAt: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: number;
}

export interface Teacher {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    createdAt: number;
}

export interface GalleryImage {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: number;
}

export interface ContactInquiry {
    id: string;
    email: string;
    mobile: string;
    message: string;
    imageUrl?: string;
    createdAt: number;
}

export interface ChatMessage {
    id: string;
    text: string;
    userName: string;
    userPhotoUrl?: string;
    imageUrl?: string;
    createdAt: number;
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
    createdAt: number;
}

export interface TestSetting {
    id?: string;
    isEnabled: boolean;
}

export interface TestEnrollment {
    id: string;
    studentName: string;
    testId: string;
    testName: string;
    enrollmentCode: string;
    enrolledAt: number;
    attemptsWaived?: boolean;
    allowedAttempts: number;
}

// --- Helper Functions ---
const generateRandomCode = (length: number) => Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)).toString();

async function sendStudentNotification(title: string, content: string, category: NotificationCategory = 'alert', recipient?: string): Promise<void> {
    if (!db) return;
    try {
        const notificationData: any = {
            title,
            content,
            category,
            createdAt: serverTimestamp(),
        };
        if (recipient) {
            notificationData.recipient = recipient;
        }
        const newPostRef = push(ref(db, "notifications"));
        await set(newPostRef, notificationData);
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

async function deleteItem(path: string): Promise<void> {
    if (!db) return;
    await remove(ref(db, path));
}

async function getAll<T>(collectionName: string): Promise<T[]> {
    if (!db) return [];
    try {
        const snapshot = await get(ref(db, collectionName));
        if (snapshot.exists()) {
            const data = snapshot.val();
            // RTDB returns an object, so we convert it to an array.
            return Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a: any, b: any) => b.createdAt - a.createdAt) as T[];
        }
    } catch (error) {
        console.error(`Error fetching from ${collectionName}:`, error);
    }
    return [];
}

// --- App-specific Functions ---
export async function getAppConfig(): Promise<AppConfig> {
    if (!db) return {};
    const snapshot = await get(ref(db, "appConfig/settings"));
    if (snapshot.exists()) {
        const config = snapshot.val();
        // Convert timestamps to Date objects if they are stored as numbers
        if (config.scholarshipDeadline) config.scholarshipDeadline = timestampToDate(config.scholarshipDeadline);
        if (config.scholarshipTestStartDate) config.scholarshipTestStartDate = timestampToDate(config.scholarshipTestStartDate);
        if (config.scholarshipTestEndDate) config.scholarshipTestEndDate = timestampToDate(config.scholarshipTestEndDate);
        if (config.admitCardDownloadStartDate) config.admitCardDownloadStartDate = timestampToDate(config.admitCardDownloadStartDate);
        if (config.resultAnnouncementDate) config.resultAnnouncementDate = timestampToDate(config.resultAnnouncementDate);
        return config;
    }
    return {};
}

export async function updateAppConfig(data: Partial<AppConfig>): Promise<void> {
    if (!db) return;
    const configRef = ref(db, "appConfig/settings");
    await update(configRef, data);
}

export async function addLiveClass({ title, link, embedCode, scheduledAt }: NewLiveClassData): Promise<void> {
    if (!db) return;
    const newPostRef = push(ref(db, 'liveClasses'));
    await set(newPostRef, {
        title,
        link: link || null,
        embedCode: embedCode || null,
        scheduledAt: new Date(scheduledAt).getTime(),
        createdAt: serverTimestamp()
    });
}
export const deleteLiveClass = (id: string) => deleteItem(`liveClasses/${id}`);
export const getLiveClasses = async (): Promise<LiveClass[]> => getAll<LiveClass>("liveClasses");

export async function addNotification({ title, content, category, recipient }: NewNotificationData): Promise<void> {
    if (!db) return;
    const newPostRef = push(ref(db, 'notifications'));
    await set(newPostRef, { title, content, category, recipient: recipient || null, createdAt: serverTimestamp() });
}
export const deleteNotification = (id: string) => deleteItem(`notifications/${id}`);
export const getNotifications = async (): Promise<Notification[]> => getAll<Notification>("notifications");

export async function addScholarshipApplication(data: Omit<ScholarshipApplicationData, 'createdAt' | 'id' | 'resultStatus' | 'applicationNumber' | 'rollNumber' | 'isPaymentVerified'>): Promise<{applicationNumber: string, rollNumber: string}> {
    if (!db) throw new Error("Database not connected");
    const q = query(ref(db, "scholarshipApplications"), orderByChild("fullName"), equalTo(data.fullName));
    const existingSnapshot = await get(q);
    if (existingSnapshot.exists()) {
        const apps = existingSnapshot.val();
        const appExists = Object.values(apps).some((app: any) => app.fatherName === data.fatherName);
        if (appExists) throw new Error("An application for this student already exists.");
    }

    const applicationNumber = `GSA${new Date().getFullYear()}${generateRandomCode(5)}`;
    const rollNumber = `R${generateRandomCode(8)}`;
    
    const newAppRef = push(ref(db, 'scholarshipApplications'));
    await set(newAppRef, {
        ...data,
        applicationNumber,
        rollNumber,
        resultStatus: 'pending',
        isPaymentVerified: false,
        createdAt: serverTimestamp(),
    });
    
    sendStudentNotification('Application Received', `Your application for ${data.fullName} (App No: ${applicationNumber}) has been received.`, 'scholarship', data.fullName);
    return { applicationNumber, rollNumber };
}
export const deleteScholarshipApplication = (id: string) => deleteItem(`scholarshipApplications/${id}`);

export async function updateScholarshipApplicationResultStatus(appId: string, status: 'pending' | 'pass' | 'fail'): Promise<void> {
    if (!db) return;
    await update(ref(db, `scholarshipApplications/${appId}`), { resultStatus: status });
}
export async function updateScholarshipApplicationPaymentStatus(appId: string, isVerified: boolean): Promise<void> {
    if (!db) return;
    await update(ref(db, `scholarshipApplications/${appId}`), { isPaymentVerified: isVerified });
}
export async function getScholarshipApplications(): Promise<ScholarshipApplicationData[]> {
    return getAll<ScholarshipApplicationData>("scholarshipApplications");
}
export async function getScholarshipApplicationByAppNumber(appNumber: string): Promise<ScholarshipApplicationData | null> {
    if (!db) return null;
    const q = query(ref(db, 'scholarshipApplications'), orderByChild('applicationNumber'), equalTo(appNumber));
    const snapshot = await get(q);
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    const key = Object.keys(data)[0];
    return { id: key, ...data[key] };
}

export async function getStudent(name: string): Promise<StudentData | null> {
    if (!db) return null;
    const studentRef = ref(db, `students/${name}`);
    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        return { id: snapshot.key, name, ...snapshot.val() };
    }
    return null;
}
export async function updateStudent(name: string, data: Partial<Omit<StudentData, 'id' | 'createdAt'>>): Promise<void> {
    if (!db) return;
    await update(ref(db, `students/${name}`), data);
}
export async function addQuizWinnings(studentName: string, amount: number): Promise<void> {
    if (amount <= 0 || !db) return;
    const studentRef = ref(db, `students/${studentName}/quizWinnings`);
    await set(studentRef, rtIncrement(amount));
}
export async function redeemWinningsForAttempts(studentName: string, enrollmentId: string, cost: number, attemptsToAdd: number): Promise<void> {
    if (!db) throw new Error("Database not available");
    const studentWinningsRef = ref(db, `students/${studentName}/quizWinnings`);
    const enrollmentAttemptsRef = ref(db, `testEnrollments/${enrollmentId}/allowedAttempts`);

    return runTransaction(studentWinningsRef, (currentWinnings) => {
        if ((currentWinnings || 0) < cost) {
            throw new Error("Insufficient winnings.");
        }
        return (currentWinnings || 0) - cost;
    }).then(() => {
        return runTransaction(enrollmentAttemptsRef, (currentAttempts) => {
            return (currentAttempts || 0) + attemptsToAdd;
        });
    }).catch(error => {
        console.error("Transaction failed: ", error);
        throw error;
    });
}
export async function getStudents(): Promise<StudentData[]> {
    const db = getDb();
    if (!db) return [];
    const snapshot = await get(ref(db, "students"));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, name: key, ...data[key] }));
    }
    return [];
}
export const deleteStudent = (name: string) => deleteItem(`students/${name}`);

export async function addTestResult(data: Omit<TestResultData, 'submittedAt' | 'id'>): Promise<void> {
    if (!db) return;
    const newRef = push(ref(db, 'testResults'));
    await set(newRef, { ...data, submittedAt: serverTimestamp() });
}
export async function addScholarshipTestResult(data: Omit<ScholarshipTestResult, 'submittedAt' | 'id'>): Promise<void> {
    if (!db) return;
    const newRef = push(ref(db, 'scholarshipTestResults'));
    await set(newRef, { ...data, submittedAt: serverTimestamp() });
}
export async function getScholarshipTestResultByAppNumber(appNumber: string): Promise<ScholarshipTestResult | null> {
    if (!db) return null;
    const q = query(ref(db, 'scholarshipTestResults'), orderByChild('applicationNumber'), equalTo(appNumber));
    const snapshot = await get(q);
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    const key = Object.keys(data)[0];
    return { id: key, ...data[key] };
}
export async function getScholarshipTestResults(): Promise<ScholarshipTestResult[]> {
    return getAll<ScholarshipTestResult>("scholarshipTestResults");
}
export const deleteScholarshipTestResult = (id: string) => deleteItem(`scholarshipTestResults/${id}`);

export async function getTestResults(): Promise<TestResultData[]> {
    return getAll<TestResultData>("testResults");
}
export async function getTestResultsForStudentByTest(studentName: string, testId: string): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(ref(db, 'testResults'), orderByChild('studentName'), equalTo(studentName));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    const allResults = snapshot.val();
    return Object.keys(allResults).map(key => ({ id: key, ...allResults[key] })).filter(r => r.testId === testId);
}
export async function getTestResultsForStudent(studentName: string): Promise<TestResultData[]> {
    if (!db) return [];
    const q = query(ref(db, 'testResults'), orderByChild('studentName'), equalTo(studentName));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    const allResults = snapshot.val();
    return Object.keys(allResults).map(key => ({ id: key, ...allResults[key] })).sort((a,b) => b.submittedAt - a.submittedAt);
}

export const addPost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "posts")), { ...data, createdAt: serverTimestamp() });
};
export const getPosts = async (): Promise<Post[]> => getAll<Post>("posts");
export const deletePost = (id: string) => deleteItem(`posts/${id}`);

export const addCurrentAffair = async (data: Omit<CurrentAffair, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "currentAffairs")), { ...data, createdAt: serverTimestamp() });
};
export const getCurrentAffairs = async (): Promise<CurrentAffair[]> => getAll<CurrentAffair>("currentAffairs");
export const deleteCurrentAffair = (id: string) => deleteItem(`currentAffairs/${id}`);

export const addVideoLecture = async (data: Omit<VideoLecture, 'id' | 'createdAt' | 'videoUrl'> & { link?: string; embedCode?: string }) => {
    if (!db) return;
    let videoUrl = '';
    if (data.link) {
        videoUrl = data.link;
    } else if (data.embedCode) {
        const match = data.embedCode.match(/src="([^"]+)"/);
        videoUrl = match ? match[1] : '';
    }
    await set(push(ref(db, "videoLectures")), { title: data.title, videoUrl, createdAt: serverTimestamp() });
};
export const getVideoLectures = async (): Promise<VideoLecture[]> => getAll<VideoLecture>("videoLectures");
export const deleteVideoLecture = (id: string) => deleteItem(`videoLectures/${id}`);

export const addDownload = async (data: Omit<Download, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "downloads")), { ...data, createdAt: serverTimestamp() });
};
export const getDownloads = async (): Promise<Download[]> => getAll<Download>("downloads");
export const deleteDownload = (id: string) => deleteItem(`downloads/${id}`);

export const addEBook = async (data: Omit<EBook, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "ebooks")), { ...data, createdAt: serverTimestamp() });
};
export const getEBooks = async (): Promise<EBook[]> => getAll<EBook>("ebooks");
export const deleteEBook = (id: string) => deleteItem(`ebooks/${id}`);

export const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "courses")), { ...data, createdAt: serverTimestamp() });
};
export const getCourses = async (): Promise<Course[]> => getAll<Course>("courses");
export const deleteCourse = (id: string) => deleteItem(`courses/${id}`);

export const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "teachers")), { ...data, createdAt: serverTimestamp() });
};
export const getTeachers = async (): Promise<Teacher[]> => getAll<Teacher>("teachers");
export const deleteTeacher = (id: string) => deleteItem(`teachers/${id}`);

export const addGalleryImage = async (data: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "galleryImages")), { ...data, createdAt: serverTimestamp() });
};
export const getGalleryImages = async (): Promise<GalleryImage[]> => getAll<GalleryImage>("galleryImages");
export const deleteGalleryImage = (id: string) => deleteItem(`galleryImages/${id}`);

export const addContactInquiry = async (data: Omit<ContactInquiry, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "contactInquiries")), { ...data, createdAt: serverTimestamp() });
};
export const getContactInquiries = async (): Promise<ContactInquiry[]> => getAll<ContactInquiry>("contactInquiries");
export const deleteContactInquiry = (id: string) => deleteItem(`contactInquiries/${id}`);

export const addChatMessage = async (data: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    if (!db) return;
    await set(push(ref(db, "chatMessages")), { ...data, createdAt: serverTimestamp() });
};

export const addCustomTest = async (data: any) => {
    if (!db) return;
    let questions: Question[];
    if (typeof data.questionsJson === 'string') {
        questions = JSON.parse(data.questionsJson);
    } else {
        questions = data.questions.map((q: any, index: number) => ({ ...q, id: index + 1 }));
    }
    const testData: Omit<CustomTest, 'id' | 'createdAt'> = {
        title: data.title, description: data.description, medium: data.medium,
        languageForAI: data.languageForAI, timeLimit: Number(data.timeLimit),
        totalQuestions: questions.length, testType: 'custom', questions: questions,
    };
    await set(ref(db, `customTests/${data.id}`), { ...testData, createdAt: serverTimestamp() });
};
export async function getCustomTests(): Promise<CustomTest[]> {
    const db = getDb();
    if (!db) return [];
    const snapshot = await get(ref(db, 'customTests'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
}
export async function getCustomTest(id: string): Promise<CustomTest | null> {
    if (!db) return null;
    const snapshot = await get(ref(db, `customTests/${id}`));
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}
export const deleteCustomTest = (id: string) => deleteItem(`customTests/${id}`);

export const getTestSettings = async (): Promise<Record<string, TestSetting>> => {
    if (!db) return {};
    const snapshot = await get(ref(db, 'testSettings'));
    return snapshot.exists() ? snapshot.val() : {};
};
export const updateTestSetting = async (testId: string, isEnabled: boolean) => {
    if (!db) return;
    await update(ref(db, 'testSettings'), { [testId]: { isEnabled } });
};

export const addTestEnrollment = async (studentName: string, testId: string, testName: string): Promise<string> => {
    if (!db) throw new Error("Database not connected");
    const q = query(ref(db, 'testEnrollments'), orderByChild('studentName'), equalTo(studentName));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const enrollments = snapshot.val();
        const existing = Object.values(enrollments).find((e: any) => e.testId === testId);
        if (existing) return (existing as TestEnrollment).enrollmentCode;
    }
    const enrollmentCode = generateRandomCode(5);
    const newRef = push(ref(db, 'testEnrollments'));
    await set(newRef, {
        studentName, testId, testName, enrollmentCode,
        enrolledAt: serverTimestamp(), attemptsWaived: false, allowedAttempts: 2
    });
    sendStudentNotification(
        'Test Enrollment Successful',
        `You have enrolled in "${testName}". Your unique 5-digit Enrollment Code is: ${enrollmentCode}. Please save this code.`,
        'general', studentName
    );
    return enrollmentCode;
};
export const deleteTestEnrollment = (id: string) => deleteItem(`testEnrollments/${id}`);
export const updateTestEnrollmentWaiver = async (enrollmentId: string, isWaived: boolean): Promise<void> => {
    if (!db) return;
    await update(ref(db, `testEnrollments/${enrollmentId}`), { attemptsWaived: isWaived });
};
export async function updateEnrollmentAllowedAttempts(enrollmentId: string, attempts: number): Promise<void> {
    if (!db) return;
    if (attempts < 0) throw new Error("Attempts cannot be negative.");
    await update(ref(db, `testEnrollments/${enrollmentId}`), { allowedAttempts: attempts });
}
export async function getEnrollmentsForStudent(studentName: string): Promise<TestEnrollment[]> {
    if (!db) return [];
    const q = query(ref(db, 'testEnrollments'), orderByChild('studentName'), equalTo(studentName));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    const enrollments = snapshot.val();
    return Object.keys(enrollments).map(key => ({ id: key, ...enrollments[key] }));
}
export async function getTestEnrollments(): Promise<TestEnrollment[]> {
    return getAll<TestEnrollment>("testEnrollments");
}

export { db };

    