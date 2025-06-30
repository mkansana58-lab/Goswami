
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import {
    addLiveClass, deleteLiveClass, getLiveClasses,
    addNotification, deleteNotification, getNotifications,
    addPost, deletePost, getPosts,
    addCurrentAffair, deleteCurrentAffair, getCurrentAffairs,
    addVideoLecture, deleteVideoLecture, getVideoLectures,
    addDownload, deleteDownload, getDownloads,
    addCourse, deleteCourse, getCourses,
    addTeacher, deleteTeacher, getTeachers,
    addGalleryImage, deleteGalleryImage, getGalleryImages,
    getScholarshipApplications, updateScholarshipApplicationResultStatus, getStudents, updateAppConfig, getAppConfig,
    getContactInquiries, addEBook, getEBooks, deleteEBook,
    addCustomTest, getCustomTests, deleteCustomTest,
    getTestSettings, updateTestSetting, getTestEnrollments,
    updateTestEnrollmentWaiver, updateEnrollmentAllowedAttempts,
    getScholarshipTestResults, deleteScholarshipTestResult, deleteScholarshipApplication, deleteStudent, deleteTestEnrollment, deleteContactInquiry,
    updateScholarshipApplicationPaymentStatus,
    type LiveClass, type Notification, type Post, type CurrentAffair,
    type VideoLecture, type Download, type Course, type AppConfig,
    type ScholarshipApplicationData, type StudentData, type Teacher, type GalleryImage,
    type ContactInquiry, type EBook, type CustomTest, type TestSetting, type TestEnrollment,
    type ScholarshipTestResult, type Question, type NotificationCategory
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Tv, Bell, GraduationCap, Users, Newspaper, ScrollText, Video, FileDown, BookCopy, Trash2, Camera, UserSquare, Mail, Library, FilePlus2, ToggleRight, ListCollapse, BarChart2, Star, CheckSquare, Shield, Key, Award, AlertCircle, Trophy, PlusCircle, QrCode, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { testsData } from '@/lib/tests-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fileToDataUrl } from '@/lib/utils';

// Schemas
const settingsSchema = z.object({
    scholarshipDeadline: z.string().optional(),
    scholarshipTestStartDate: z.string().optional(),
    scholarshipTestEndDate: z.string().optional(),
    admitCardDownloadStartDate: z.string().optional(),
    cityIntimationSlipStartDate: z.string().optional(),
    resultAnnouncementDate: z.string().optional(),
    splashImage: z.any().optional(),
    scholarshipTestId: z.string().optional(),
    paymentQrCode: z.any().optional(),
});
const liveClassSchema = z.object({ title: z.string().min(3), link: z.string().url(), scheduledAt: z.string().min(1) });
const notificationSchema = z.object({ 
    title: z.string().min(3), 
    content: z.string().min(10),
    category: z.enum(['general', 'news', 'result', 'scholarship', 'alert']),
    recipient: z.string().optional(),
});
const postSchema = z.object({ title: z.string().min(3), content: z.string().min(10), imageUrl: z.any().optional() });
const currentAffairSchema = z.object({ title: z.string().min(3), content: z.string().min(10) });
const videoLectureSchema = z.object({ title: z.string().min(3), videoUrl: z.string().url() });
const downloadSchema = z.object({ title: z.string().min(3), pdfUrl: z.string().url() });
const eBookSchema = z.object({ title: z.string().min(3), pdfUrl: z.string().url(), imageUrl: z.any().optional() });
const courseSchema = z.object({ title: z.string().min(3), description: z.string().min(10), imageUrl: z.any().optional() });
const teacherSchema = z.object({ name: z.string().min(3), description: z.string().min(10), imageUrl: z.any().optional() });
const galleryImageSchema = z.object({ caption: z.string().min(3), imageUrl: z.any().refine(f => f?.length === 1, "Image is required.") });
const customTestJsonSchema = z.object({
  id: z.string().min(3, "Test ID is required. Use only letters, numbers, and dashes (e.g., 'my-test-id').").regex(/^[a-z0-9-]+$/, "ID must be lowercase with letters, numbers, and dashes only."),
  title: z.string().min(3),
  description: z.string().min(10),
  timeLimit: z.coerce.number().min(1),
  medium: z.string().min(1),
  languageForAI: z.string().min(1).describe("This is for the AI certificate generation, e.g., 'Hindi' or 'English'"),
  questionsJson: z.string().refine((val) => {
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.length > 0;
    } catch {
        return false;
    }
  }, { message: "Must be a valid, non-empty JSON array of questions." })
});


// Helper to format timestamp for datetime-local input
const toInputDateTimeFormat = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "";
    try {
        const date = timestamp.toDate();
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return "";
    }
};

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const customTestJsonExample = `[
  {
    "id": 1,
    "question": "What is the capital of India?",
    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    "answer": "New Delhi"
  },
  {
    "id": 2,
    "question": "2 + 2 = ?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  }
]`;

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<{
        liveClasses: LiveClass[], notifications: Notification[], posts: Post[],
        currentAffairs: CurrentAffair[], videoLectures: VideoLecture[], downloads: Download[],
        courses: Course[], scholarshipApps: ScholarshipApplicationData[], students: StudentData[],
        teachers: Teacher[], galleryImages: GalleryImage[], contactInquiries: ContactInquiry[],
        ebooks: EBook[], customTests: CustomTest[], testSettings: Record<string, TestSetting>,
        testEnrollments: TestEnrollment[], scholarshipTestResults: ScholarshipTestResult[],
    }>({
        liveClasses: [], notifications: [], posts: [], currentAffairs: [], videoLectures: [], 
        downloads: [], courses: [], scholarshipApps: [], students: [], teachers: [], 
        galleryImages: [], contactInquiries: [], ebooks: [], customTests: [], 
        testSettings: {}, testEnrollments: [], scholarshipTestResults: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editableAttempts, setEditableAttempts] = useState<Record<string, number>>({});

    const settingsForm = useForm<z.infer<typeof settingsSchema>>({ resolver: zodResolver(settingsSchema) });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
                config, liveClasses, notifications, posts, currentAffairs, videoLectures,
                downloads, courses, scholarshipApps, students, teachers, galleryImages,
                contactInquiries, ebooks, customTests, testSettings, testEnrollments,
                scholarshipTestResults
            ] = await Promise.all([
                getAppConfig(), getLiveClasses(), getNotifications(), getPosts(),
                getCurrentAffairs(), getVideoLectures(), getDownloads(), getCourses(),
                getScholarshipApplications(), getStudents(), getTeachers(), getGalleryImages(),
                getContactInquiries(), getEBooks(), getCustomTests(), getTestSettings(), getTestEnrollments(),
                getScholarshipTestResults()
            ]);
            settingsForm.reset({
                scholarshipDeadline: toInputDateTimeFormat(config.scholarshipDeadline),
                scholarshipTestStartDate: toInputDateTimeFormat(config.scholarshipTestStartDate),
                scholarshipTestEndDate: toInputDateTimeFormat(config.scholarshipTestEndDate),
                admitCardDownloadStartDate: toInputDateTimeFormat(config.admitCardDownloadStartDate),
                cityIntimationSlipStartDate: toInputDateTimeFormat(config.cityIntimationSlipStartDate),
                resultAnnouncementDate: toInputDateTimeFormat(config.resultAnnouncementDate),
                scholarshipTestId: config.scholarshipTestId,
            });
            setData({
                liveClasses, notifications, posts, currentAffairs, videoLectures,
                downloads, courses, scholarshipApps, students, teachers, galleryImages,
                contactInquiries, ebooks, customTests, testSettings, testEnrollments,
                scholarshipTestResults
            });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch data from server." });
        } finally {
            setIsLoading(false);
        }
    }, [settingsForm, toast]);

    useEffect(() => {
        if (admin) {
            fetchData();
        }
    }, [admin, fetchData]);

    const handleSaveSettings = async (values: z.infer<typeof settingsSchema>) => {
        const { splashImage, paymentQrCode, ...otherValues } = values;

        // Handle "none" value from Select by converting it to an empty string
        const scholarshipTestId = otherValues.scholarshipTestId === 'none' ? '' : otherValues.scholarshipTestId;

        const configData: Partial<AppConfig> = {
            ...(otherValues.scholarshipDeadline && { scholarshipDeadline: Timestamp.fromDate(new Date(otherValues.scholarshipDeadline)) }),
            ...(otherValues.scholarshipTestStartDate && { scholarshipTestStartDate: Timestamp.fromDate(new Date(otherValues.scholarshipTestStartDate)) }),
            ...(otherValues.scholarshipTestEndDate && { scholarshipTestEndDate: Timestamp.fromDate(new Date(otherValues.scholarshipTestEndDate)) }),
            ...(otherValues.admitCardDownloadStartDate && { admitCardDownloadStartDate: Timestamp.fromDate(new Date(otherValues.admitCardDownloadStartDate)) }),
            ...(otherValues.cityIntimationSlipStartDate && { cityIntimationSlipStartDate: Timestamp.fromDate(new Date(otherValues.cityIntimationSlipStartDate)) }),
            ...(otherValues.resultAnnouncementDate && { resultAnnouncementDate: Timestamp.fromDate(new Date(otherValues.resultAnnouncementDate)) }),
            scholarshipTestId: scholarshipTestId || '',
        };

        try {
            if (splashImage?.[0]) {
                configData.splashImageUrl = await fileToDataUrl(splashImage[0]);
            }
            if (paymentQrCode?.[0]) {
                configData.paymentQrCodeUrl = await fileToDataUrl(paymentQrCode[0]);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Image Error", description: error.message });
            return; // Stop execution if image processing fails
        }

        await updateAppConfig(configData);
        toast({ title: "Settings Saved" });
    };

    const handleResultStatusChange = async (appId: string, status: 'pending' | 'pass' | 'fail') => {
        try {
            await updateScholarshipApplicationResultStatus(appId, status);
            setData(prevData => ({
                ...prevData,
                scholarshipApps: prevData.scholarshipApps.map(app =>
                    app.id === appId ? { ...app, resultStatus: status } : app
                )
            }));
            toast({ title: "Result status updated!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update result status." });
            fetchData();
        }
    };
    
    const handlePaymentStatusChange = async (appId: string, isVerified: boolean) => {
         try {
            await updateScholarshipApplicationPaymentStatus(appId, isVerified);
            setData(prevData => ({
                ...prevData,
                scholarshipApps: prevData.scholarshipApps.map(app => 
                    app.id === appId ? { ...app, isPaymentVerified: isVerified } : app
                )
            }));
            toast({ title: "Payment status updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update payment status." });
            fetchData();
        }
    }
    
    const handleTestWaiverToggle = async (enrollmentId: string, isWaived: boolean) => {
        try {
            await updateTestEnrollmentWaiver(enrollmentId, isWaived);
            setData(prevData => ({
                ...prevData,
                testEnrollments: prevData.testEnrollments.map(e => 
                    e.id === enrollmentId ? { ...e, attemptsWaived: isWaived } : e
                )
            }));
            toast({ title: "Waiver status updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update waiver status." });
            fetchData();
        }
    };

    const handleAllowedAttemptsUpdate = async (enrollmentId: string) => {
        const attempts = editableAttempts[enrollmentId];
        if (typeof attempts !== 'number' || attempts < 0) {
            toast({ variant: 'destructive', title: 'Invalid attempt count' });
            return;
        }
        try {
            await updateEnrollmentAllowedAttempts(enrollmentId, attempts);
            toast({ title: 'Total attempts updated!' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to update attempts' });
        }
    };

    const handleDelete = async (deleteFn: (id: string) => Promise<void>, id: string, name: string) => {
        try {
            await deleteFn(id);
            toast({ title: `${name} Deleted` });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Failed to delete ${name}.` });
        }
    };


    if (isAuthLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!admin) { router.replace('/admin-login'); return null; }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
            {isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-10 w-10 animate-spin" /></div> : (
                 <Tabs defaultValue="management" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="management"><ListCollapse className="mr-2 h-4 w-4" /> {t('manageContent')}</TabsTrigger>
                        <TabsTrigger value="view"><BarChart2 className="mr-2 h-4 w-4" /> {t('viewData')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="management" className="mt-4">
                        <Accordion type="multiple" className="w-full space-y-4">
                            <AdminSection title={t('academySettings')} icon={Settings}>
                                <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)} className="space-y-4">
                                     <div className="space-y-2">
                                        <Label>Online Scholarship Test</Label>
                                        <Select
                                            value={settingsForm.watch('scholarshipTestId') || ''}
                                            onValueChange={(value) => settingsForm.setValue('scholarshipTestId', value)}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select the test to use for online scholarships" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {data.customTests.map(test => (
                                                    <SelectItem key={test.id} value={test.id}>{test.title} ({test.id})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-destructive text-xs">{settingsForm.formState.errors.scholarshipTestId?.message}</p>
                                    </div>
                                    <Separator />
                                     <div><Label>{t('scholarshipDeadline')}</Label><Input type="datetime-local" {...settingsForm.register('scholarshipDeadline')} /></div>
                                     <div><Label>Scholarship Test Start Date</Label><Input type="datetime-local" {...settingsForm.register('scholarshipTestStartDate')} /></div>
                                     <div><Label>Scholarship Test End Date</Label><Input type="datetime-local" {...settingsForm.register('scholarshipTestEndDate')} /></div>
                                     <div><Label>{t('admitCardStartDate')}</Label><Input type="datetime-local" {...settingsForm.register('admitCardDownloadStartDate')} /></div>
                                     <div><Label>{t('resultAnnouncementDate')}</Label><Input type="datetime-local" {...settingsForm.register('resultAnnouncementDate')} /></div>
                                     <div><Label>Splash Screen Image (for App Start)</Label><Input type="file" accept="image/*" {...settingsForm.register('splashImage')} /></div>
                                     <div><Label className="flex items-center gap-2"><QrCode/> Payment QR Code</Label><Input type="file" accept="image/*" {...settingsForm.register('paymentQrCode')} /></div>
                                     <Button type="submit">{t('saveSettings')}</Button>
                                </form>
                            </AdminSection>

                            <AdminSection title="Test Availability" icon={ToggleRight}>
                                <TestSettingsManager initialSettings={data.testSettings} customTests={data.customTests} />
                            </AdminSection>
                            
                            <AdminSection title="Manage Custom Tests" icon={FilePlus2}>
                                <Tabs defaultValue="builder" className="mt-4">
                                    <TabsList>
                                        <TabsTrigger value="builder">Visual Builder</TabsTrigger>
                                        <TabsTrigger value="json">JSON Input</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="builder">
                                        <CustomTestBuilderForm onRefresh={fetchData} />
                                    </TabsContent>
                                    <TabsContent value="json">
                                        <p className="text-sm text-muted-foreground my-2">Use the sample JSON format below for the 'Questions JSON' field.</p>
                                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto mb-4"><code>{customTestJsonExample}</code></pre>
                                        <CrudForm schema={customTestJsonSchema} onSubmit={addCustomTest} onRefresh={fetchData} fields={{
                                            id: 'text', title: 'text', description: 'textarea', timeLimit: 'number',
                                            medium: 'text', languageForAI: 'text', questionsJson: 'textarea',
                                        }} />
                                    </TabsContent>
                                </Tabs>

                                <DataTable data={data.customTests} columns={['id', 'title', 'description']} onDelete={deleteCustomTest} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title={t('manageLiveClasses')} icon={Tv}>
                                <CrudForm schema={liveClassSchema} onSubmit={addLiveClass} onRefresh={fetchData} fields={{title: 'text', link: 'url', scheduledAt: 'datetime-local'}} />
                                <DataTable data={data.liveClasses} columns={['title', 'link']} onDelete={deleteLiveClass} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title={t('manageNotifications')} icon={Bell}>
                                <NotificationForm onRefresh={fetchData} />
                                <DataTable data={data.notifications} columns={['title', 'content', 'category']} onDelete={deleteNotification} onRefresh={fetchData} />
                            </AdminSection>
                            
                            <AdminSection title={t('manageDailyPosts')} icon={Newspaper}>
                                <CrudForm schema={postSchema} onSubmit={addPost} onRefresh={fetchData} fields={{title: 'text', content: 'textarea', imageUrl: 'file'}} />
                                <DataTable data={data.posts} columns={['title', 'content']} onDelete={deletePost} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title={t('manageCurrentAffairs')} icon={ScrollText}>
                                <CrudForm schema={currentAffairSchema} onSubmit={addCurrentAffair} onRefresh={fetchData} fields={{title: 'text', content: 'textarea'}} />
                                <DataTable data={data.currentAffairs} columns={['title', 'content']} onDelete={deleteCurrentAffair} onRefresh={fetchData} />
                            </AdminSection>
                            
                            <AdminSection title={t('manageVideoLectures')} icon={Video}>
                                <CrudForm schema={videoLectureSchema} onSubmit={addVideoLecture} onRefresh={fetchData} fields={{title: 'text', videoUrl: 'url'}} />
                                <DataTable data={data.videoLectures} columns={['title', 'videoUrl']} onDelete={deleteVideoLecture} onRefresh={fetchData} />
                            </AdminSection>
                            
                            <AdminSection title={t('manageDownloads')} icon={FileDown}>
                                <CrudForm schema={downloadSchema} onSubmit={addDownload} onRefresh={fetchData} fields={{title: 'text', pdfUrl: 'url'}} />
                                <DataTable data={data.downloads} columns={['title', 'pdfUrl']} onDelete={deleteDownload} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title="Manage E-Books" icon={Library}>
                                <CrudForm schema={eBookSchema} onSubmit={addEBook} onRefresh={fetchData} fields={{title: 'text', pdfUrl: 'url', imageUrl: 'file'}} />
                                <DataTable data={data.ebooks} columns={['title', 'pdfUrl']} onDelete={deleteEBook} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title={t('manageCourses')} icon={BookCopy}>
                                <CrudForm schema={courseSchema} onSubmit={addCourse} onRefresh={fetchData} fields={{title: 'text', description: 'textarea', imageUrl: 'file'}} />
                                <DataTable data={data.courses} columns={['title', 'description']} onDelete={deleteCourse} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title="Manage Teachers" icon={UserSquare}>
                                <CrudForm schema={teacherSchema} onSubmit={addTeacher} onRefresh={fetchData} fields={{name: 'text', description: 'textarea', imageUrl: 'file'}} />
                                <DataTable data={data.teachers} columns={['name', 'description']} onDelete={deleteTeacher} onRefresh={fetchData} />
                            </AdminSection>

                            <AdminSection title="Manage Coaching Gallery" icon={Camera}>
                                <CrudForm schema={galleryImageSchema} onSubmit={addGalleryImage} onRefresh={fetchData} fields={{caption: 'text', imageUrl: 'file'}} />
                                <DataTable data={data.galleryImages} columns={['caption']} onDelete={deleteGalleryImage} onRefresh={fetchData} />
                            </AdminSection>
                        </Accordion>
                    </TabsContent>
                    <TabsContent value="view" className="mt-4">
                         <Accordion type="multiple" className="w-full space-y-4">
                            <AdminSection title="Scholarship Applications" icon={GraduationCap}>
                                <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>App No</TableHead><TableHead>Docs</TableHead><TableHead>Payment Verified</TableHead><TableHead>Result</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {data.scholarshipApps.map(app => (
                                            <TableRow key={app.id}>
                                                <TableCell>{app.fullName}<br/><span className="text-muted-foreground text-xs">{app.fatherName}</span></TableCell>
                                                <TableCell><span className="font-mono text-xs">{app.applicationNumber}</span></TableCell>
                                                <TableCell className="flex gap-2"><ImagePreview url={app.photoUrl} triggerText="Photo" /><ImagePreview url={app.signatureUrl} triggerText="Sign" /></TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Switch
                                                            disabled={app.testMode !== 'online'}
                                                            checked={app.isPaymentVerified ?? false}
                                                            onCheckedChange={(isChecked) => handlePaymentStatusChange(app.id!, isChecked)}
                                                            aria-label="Toggle payment verification"
                                                        />
                                                         <span className="text-xs text-muted-foreground">{app.isPaymentVerified ? "ON" : "OFF"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={app.resultStatus || 'pending'}
                                                        onValueChange={(value) => handleResultStatusChange(app.id!, value as 'pending' | 'pass' | 'fail')}
                                                    >
                                                        <SelectTrigger className="w-[100px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">{t('pending')}</SelectItem>
                                                            <SelectItem value="pass">{t('pass')}</SelectItem>
                                                            <SelectItem value="fail">{t('fail')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>Delete application for {app.fullName}?</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(deleteScholarshipApplication, app.id!, 'Application')}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AdminSection>

                             <AdminSection title="Scholarship Test Results" icon={Trophy}>
                                <Table><TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>Score</TableHead><TableHead>Time</TableHead><TableHead>Target Test Code</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {data.scholarshipTestResults.map((result, index) => (
                                            <TableRow key={result.id}>
                                                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                                <TableCell>{result.studentName}<br/><span className="text-muted-foreground text-xs">{result.applicationNumber}</span></TableCell>
                                                <TableCell>{result.score}/{result.totalQuestions} ({result.percentage.toFixed(1)}%)</TableCell>
                                                <TableCell>{formatTime(result.timeTaken)}</TableCell>
                                                <TableCell><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{result.targetTestEnrollmentCode || 'N/A'}</span></TableCell>
                                                <TableCell>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>Delete test result for {result.studentName}?</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(deleteScholarshipTestResult, result.id!, 'Test Result')}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AdminSection>

                            <AdminSection title="Registered Students" icon={Users}>
                               <Table><TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead>Registered On</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                   <TableBody>
                                       {data.students.map(s => (
                                           <TableRow key={s.id}><TableCell><ImagePreview url={s.photoUrl} triggerText={<Image src={s.photoUrl || `https://placehold.co/40x40.png?text=${s.name[0]}`} alt="" width={40} height={40} className="rounded-full w-10 h-10 object-cover" data-ai-hint="student photo" />} /></TableCell><TableCell>{s.name}<br/><span className="text-muted-foreground text-xs">{s.fatherName}</span></TableCell><TableCell>Class: {s.class}<br/>School: {s.school}</TableCell><TableCell>{format(s.createdAt.toDate(), 'PPP')}</TableCell>
                                           <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>Delete student {s.name}?</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(deleteStudent, s.id!, 'Student')}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                           </TableRow>
                                       ))}
                                   </TableBody>
                               </Table>
                            </AdminSection>

                            <AdminSection title={t('testEnrollments')} icon={Star}>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('enrolledStudent')}</TableHead>
                                            <TableHead>{t('test')}</TableHead>
                                            <TableHead>Total Attempts</TableHead>
                                            <TableHead>Attempts Waived</TableHead>
                                            <TableHead>{t('enrolledAt')}</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.testEnrollments.map(e => (
                                            <TableRow key={e.id}>
                                                <TableCell>{e.studentName}</TableCell>
                                                <TableCell>{e.testName}<br/><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{e.enrollmentCode}</span></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            type="number" 
                                                            className="w-20 h-9"
                                                            value={editableAttempts[e.id!] ?? e.allowedAttempts}
                                                            onChange={(ev) => setEditableAttempts(prev => ({...prev, [e.id!]: parseInt(ev.target.value, 10)}))}
                                                        />
                                                        <Button size="sm" onClick={() => handleAllowedAttemptsUpdate(e.id!)} disabled={editableAttempts[e.id!] === undefined || editableAttempts[e.id!] === e.allowedAttempts}>
                                                            Save
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Switch
                                                            checked={e.attemptsWaived ?? false}
                                                            onCheckedChange={(isChecked) => handleTestWaiverToggle(e.id!, isChecked)}
                                                            aria-label="Toggle test attempt waiver"
                                                        />
                                                        <span className="text-xs text-muted-foreground">{e.attemptsWaived ? "ON" : "OFF"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{format(e.enrolledAt.toDate(), 'PPP p')}</TableCell>
                                                <TableCell>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>Delete enrollment for {e.studentName}?</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(deleteTestEnrollment, e.id!, 'Enrollment')}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AdminSection>

                            <AdminSection title="Contact Inquiries" icon={Mail}>
                                <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Mobile</TableHead><TableHead>Message</TableHead><TableHead>Attachment</TableHead><TableHead>Submitted On</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {data.contactInquiries.map(inquiry => (
                                            <TableRow key={inquiry.id}>
                                                <TableCell>{inquiry.email}</TableCell>
                                                <TableCell>{inquiry.mobile}</TableCell>
                                                <TableCell className="max-w-xs break-words">{inquiry.message}</TableCell>
                                                <TableCell><ImagePreview url={inquiry.imageUrl} triggerText="View Image" /></TableCell>
                                                <TableCell>{format(inquiry.createdAt.toDate(), 'PPP p')}</TableCell>
                                                <TableCell>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>Delete inquiry from {inquiry.email}?</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(deleteContactInquiry, inquiry.id!, 'Inquiry')}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AdminSection>
                         </Accordion>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

// Reusable Components for Admin Page
const AdminSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <Card><AccordionItem value={title} className="border-b-0">
        <AccordionTrigger className="p-6"><div className="flex items-center gap-3"><Icon className="h-6 w-6 text-primary" /><CardTitle>{title}</CardTitle></div></AccordionTrigger>
        <AccordionContent className="p-6 pt-0">{children}</AccordionContent>
    </AccordionItem></Card>
);

const CrudForm = ({ schema, onSubmit, onRefresh, fields }: { schema: z.ZodObject<any>, onSubmit: (data: any) => Promise<any>, onRefresh: () => void, fields: Record<string, 'text' | 'url' | 'textarea' | 'datetime-local' | 'file' | 'number'> }) => {
    const { t } = useLanguage();
    const form = useForm({ resolver: zodResolver(schema) });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const dataToSubmit = { ...values };

            for (const fieldName in fields) {
                if (fields[fieldName] === 'file' && values[fieldName]?.[0]) {
                    const file = values[fieldName][0];
                    dataToSubmit[fieldName] = await fileToDataUrl(file);
                } else if (fields[fieldName] === 'file') {
                    delete dataToSubmit[fieldName];
                }
            }
            
            await onSubmit(dataToSubmit);
            toast({ title: "Success", description: "Item added successfully." });
            form.reset();
            onRefresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
            {Object.entries(fields).map(([fieldName, fieldType]) => (
                <div key={fieldName}>
                    <Label className="capitalize">{t(fieldName as any) || fieldName.replace(/([A-Z])/g, ' $1')}</Label>
                    {fieldType === 'textarea' ?
                        <Textarea {...form.register(fieldName)} disabled={isSubmitting} /> :
                    fieldType === 'file' ?
                        <Input type="file" accept="image/*, .pdf" {...form.register(fieldName)} disabled={isSubmitting}/> :
                        <Input type={fieldType} {...form.register(fieldName)} disabled={isSubmitting} />
                    }
                    <p className="text-destructive text-sm mt-1">{form.formState.errors[fieldName]?.message as string}</p>
                </div>
            ))}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('add')}</Button>
        </form>
    );
};

const NotificationForm = ({ onRefresh }: { onRefresh: () => void }) => {
    const { t } = useLanguage();
    const form = useForm<z.infer<typeof notificationSchema>>({ resolver: zodResolver(notificationSchema) });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const categories: NotificationCategory[] = ['general', 'news', 'result', 'scholarship', 'alert'];

    const handleFormSubmit = async (values: z.infer<typeof notificationSchema>) => {
        setIsSubmitting(true);
        try {
            await addNotification(values);
            toast({ title: "Success", description: "Notification sent successfully." });
            form.reset();
            onRefresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div>
                <Label>{t('title')}</Label>
                <Input {...form.register('title')} disabled={isSubmitting} />
                <p className="text-destructive text-sm mt-1">{form.formState.errors.title?.message}</p>
            </div>
             <div>
                <Label>{t('content')}</Label>
                <Textarea {...form.register('content')} disabled={isSubmitting} />
                <p className="text-destructive text-sm mt-1">{form.formState.errors.content?.message}</p>
            </div>
             <div>
                <Label>Category</Label>
                <Select onValueChange={(value: NotificationCategory) => form.setValue('category', value)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                             <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-destructive text-sm mt-1">{form.formState.errors.category?.message}</p>
            </div>
             <div>
                <Label>Recipient (Optional: for specific student)</Label>
                <Input {...form.register('recipient')} disabled={isSubmitting} placeholder="Enter student's full name" />
                <p className="text-destructive text-sm mt-1">{form.formState.errors.recipient?.message}</p>
            </div>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Notification</Button>
        </form>
    );
};

const DataTable = ({ data, columns, onDelete, onRefresh }: { data: any[], columns: string[], onDelete: (id: string) => Promise<void>, onRefresh: () => void }) => {
    const { t } = useLanguage();
    const { toast } = useToast();

    const handleDelete = async (id: string) => {
        try {
            await onDelete(id);
            toast({ title: "Item Deleted" });
            onRefresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        }
    };
    
    if (data.length === 0) return <p className="text-muted-foreground text-center p-4">{t('noData')}</p>;

    return (
        <Table><TableHeader><TableRow>
            {columns.map(col => <TableHead key={col} className="capitalize">{t(col as any) || col.replace(/([A-Z])/g, ' $1')}</TableHead>)}
            <TableHead>{t('action')}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
            {data.map(item => (
                <TableRow key={item.id}>
                    {columns.map(col => <TableCell key={col} className="max-w-xs break-words">{item[col]}</TableCell>)}
                    <TableCell>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteDesc')}</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>{t('delete')}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody></Table>
    );
};


const ImagePreview = ({ url, triggerText }: { url?: string; triggerText: React.ReactNode }) => {
    if (!url) return <span className="text-xs text-muted-foreground">N/A</span>;
    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-auto p-1">{triggerText}</Button></DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Image Preview</DialogTitle></DialogHeader>
                <div className="flex justify-center p-4"><Image src={url} alt="Preview" width={400} height={400} className="max-w-full h-auto rounded-md" /></div>
            </DialogContent>
        </Dialog>
    );
};

const TestSettingsManager = ({ initialSettings, customTests }: { initialSettings: Record<string, TestSetting>, customTests: CustomTest[] }) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const allStaticTests = Object.values(testsData);
    const allTests = [...allStaticTests, ...customTests];
    const [settings, setSettings] = useState(initialSettings);

    const handleToggle = async (testId: string, isEnabled: boolean) => {
        const originalState = settings[testId]?.isEnabled ?? true;
        setSettings(prev => ({ ...prev, [testId]: { ...prev[testId], isEnabled } }));
        try {
            await updateTestSetting(testId, isEnabled);
            toast({ title: "Setting Updated" });
        } catch (e) {
            toast({ variant: "destructive", title: "Update Failed" });
            setSettings(prev => ({ ...prev, [testId]: { ...prev[testId], isEnabled: originalState } }));
        }
    };

    return (
        <div className="space-y-2">
            {allTests.map(test => {
                const isEnabled = settings[test.id]?.isEnabled ?? true; // Default to enabled
                return (
                    <div key={test.id} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{t(test.title as any) || test.title}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${isEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                            <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => handleToggle(test.id, checked)}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const testBuilderSchema = z.object({
  id: z.string().min(3, "Test ID is required.").regex(/^[a-z0-9-]+$/, "ID must be lowercase with letters, numbers, and dashes only."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  timeLimit: z.coerce.number().min(1, "Time limit is required."),
  medium: z.string().min(1, "Medium is required."),
  languageForAI: z.string().min(1, "Language for AI is required."),
  questions: z.array(z.object({
    question: z.string().min(1, "Question text is required."),
    options: z.array(z.string().min(1, "Option text cannot be empty.")).length(4, "There must be exactly 4 options."),
    answer: z.string().min(1, "A correct answer must be selected."),
  })).min(1, "At least one question is required."),
});

type TestBuilderFormValues = z.infer<typeof testBuilderSchema>;

const CustomTestBuilderForm = ({ onRefresh }: { onRefresh: () => void }) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TestBuilderFormValues>({
        resolver: zodResolver(testBuilderSchema),
        defaultValues: {
            id: "", title: "", description: "", timeLimit: 60, medium: "Hindi", languageForAI: "Hindi",
            questions: [{ question: "", options: ["", "", "", ""], answer: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions"
    });

    const onSubmit = async (data: TestBuilderFormValues) => {
        setIsSubmitting(true);
        try {
            const questionsWithIds = data.questions.map((q, index) => ({...q, id: index + 1}));
            const dataToSave = {
                ...data,
                questionsJson: JSON.stringify(questionsWithIds),
            };
            
            await addCustomTest(dataToSave);
            toast({ title: "Success", description: "Custom test created successfully." });
            form.reset();
            onRefresh();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to create custom test." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Test ID</Label><Input {...form.register('id')} /><p className="text-destructive text-xs">{form.formState.errors.id?.message}</p></div>
                <div><Label>Title</Label><Input {...form.register('title')} /><p className="text-destructive text-xs">{form.formState.errors.title?.message}</p></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea {...form.register('description')} /><p className="text-destructive text-xs">{form.formState.errors.description?.message}</p></div>
                <div><Label>Time Limit (minutes)</Label><Input type="number" {...form.register('timeLimit')} /><p className="text-destructive text-xs">{form.formState.errors.timeLimit?.message}</p></div>
                <div><Label>Medium</Label><Input {...form.register('medium')} /><p className="text-destructive text-xs">{form.formState.errors.medium?.message}</p></div>
                <div><Label>Language for AI</Label><Input {...form.register('languageForAI')} /><p className="text-destructive text-xs">{form.formState.errors.languageForAI?.message}</p></div>
            </div>

            <Separator />
            
            <h3 className="text-lg font-semibold">Questions</h3>
            {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 border rounded-md relative">
                    <Label className="font-bold">Question {index + 1}</Label>
                    <Textarea placeholder="Question text..." {...form.register(`questions.${index}.question`)} />
                    <p className="text-destructive text-xs">{form.formState.errors.questions?.[index]?.question?.message}</p>

                    <RadioGroup onValueChange={(value) => form.setValue(`questions.${index}.answer`, value)}>
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                    <RadioGroupItem value={form.watch(`questions.${index}.options.${optionIndex}`)} id={`q${index}-opt${optionIndex}`} />
                                    <Input placeholder={`Option ${optionIndex + 1}`} {...form.register(`questions.${index}.options.${optionIndex}`)} />
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                    <p className="text-destructive text-xs">{form.formState.errors.questions?.[index]?.options?.message}</p>
                    <p className="text-destructive text-xs">{form.formState.errors.questions?.[index]?.answer?.message}</p>

                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="mt-2">Remove Question</Button>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={() => append({ question: "", options: ["", "", "", ""], answer: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
            
            <p className="text-destructive text-xs">{form.formState.errors.questions?.message}</p>
            
            <Separator />

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Test
            </Button>
        </form>
    );
};
