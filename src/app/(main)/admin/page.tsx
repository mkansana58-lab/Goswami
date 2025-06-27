
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
    getScholarshipApplications, getStudents, updateAppConfig, getAppConfig,
    type LiveClass, type Notification, type Post, type CurrentAffair,
    type VideoLecture, type Download, type Course, type AppConfig,
    type ScholarshipApplicationData, type StudentData, type Teacher, type GalleryImage
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Tv, Bell, GraduationCap, Users, Newspaper, ScrollText, Video, FileDown, BookCopy, Trash2, Camera, UserSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// Schemas
const settingsSchema = z.object({
    scholarshipDeadline: z.string().optional(),
    examDate: z.string().optional(),
    admitCardDownloadStartDate: z.string().optional(),
});
const liveClassSchema = z.object({ title: z.string().min(3), link: z.string().url(), scheduledAt: z.string().min(1) });
const notificationSchema = z.object({ title: z.string().min(3), content: z.string().min(10) });
const postSchema = z.object({ title: z.string().min(3), content: z.string().min(10), imageUrl: z.any().optional() });
const currentAffairSchema = z.object({ title: z.string().min(3), content: z.string().min(10) });
const videoLectureSchema = z.object({ title: z.string().min(3), videoUrl: z.string().url() });
const downloadSchema = z.object({ title: z.string().min(3), pdfUrl: z.string().url() });
const courseSchema = z.object({ title: z.string().min(3), description: z.string().min(10), imageUrl: z.any().optional() });
const teacherSchema = z.object({ name: z.string().min(3), description: z.string().min(10), imageUrl: z.any().optional() });
const galleryImageSchema = z.object({ caption: z.string().min(3), imageUrl: z.any().refine(f => f?.length === 1, "Image is required.") });


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

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState({
        liveClasses: [] as LiveClass[], notifications: [] as Notification[], posts: [] as Post[],
        currentAffairs: [] as CurrentAffair[], videoLectures: [] as VideoLecture[], downloads: [] as Download[],
        courses: [] as Course[], scholarshipApps: [] as ScholarshipApplicationData[], students: [] as StudentData[],
        teachers: [] as Teacher[], galleryImages: [] as GalleryImage[],
    });
    const [isLoading, setIsLoading] = useState(true);

    const settingsForm = useForm<z.infer<typeof settingsSchema>>({ resolver: zodResolver(settingsSchema) });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
                config, liveClasses, notifications, posts, currentAffairs, videoLectures,
                downloads, courses, scholarshipApps, students, teachers, galleryImages
            ] = await Promise.all([
                getAppConfig(), getLiveClasses(), getNotifications(), getPosts(),
                getCurrentAffairs(), getVideoLectures(), getDownloads(), getCourses(),
                getScholarshipApplications(), getStudents(), getTeachers(), getGalleryImages()
            ]);
            settingsForm.reset({
                scholarshipDeadline: toInputDateTimeFormat(config.scholarshipDeadline),
                examDate: toInputDateTimeFormat(config.examDate),
                admitCardDownloadStartDate: toInputDateTimeFormat(config.admitCardDownloadStartDate),
            });
            setData({
                liveClasses, notifications, posts, currentAffairs, videoLectures,
                downloads, courses, scholarshipApps, students, teachers, galleryImages
            });
        } catch (error) {
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
        const configData: Partial<AppConfig> = {
            ...(values.scholarshipDeadline && { scholarshipDeadline: Timestamp.fromDate(new Date(values.scholarshipDeadline)) }),
            ...(values.examDate && { examDate: Timestamp.fromDate(new Date(values.examDate)) }),
            ...(values.admitCardDownloadStartDate && { admitCardDownloadStartDate: Timestamp.fromDate(new Date(values.admitCardDownloadStartDate)) }),
        };
        await updateAppConfig(configData);
        toast({ title: "Settings Saved" });
    };

    if (isAuthLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!admin) { router.replace('/admin-login'); return null; }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
            {isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-10 w-10 animate-spin" /></div> : (
                <Accordion type="multiple" collapsible className="w-full space-y-4">
                    
                    <AdminSection title={t('academySettings')} icon={Settings}>
                        <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)} className="space-y-4">
                             <div><Label>{t('scholarshipDeadline')}</Label><Input type="datetime-local" {...settingsForm.register('scholarshipDeadline')} /></div>
                             <div><Label>{t('examDate')}</Label><Input type="datetime-local" {...settingsForm.register('examDate')} /></div>
                             <div><Label>{t('admitCardStartDate')}</Label><Input type="datetime-local" {...settingsForm.register('admitCardDownloadStartDate')} /></div>
                             <Button type="submit">{t('saveSettings')}</Button>
                        </form>
                    </AdminSection>

                    <AdminSection title={t('manageLiveClasses')} icon={Tv}>
                        <CrudForm schema={liveClassSchema} onSubmit={addLiveClass} onRefresh={fetchData} fields={{title: 'text', link: 'url', scheduledAt: 'datetime-local'}} />
                        <DataTable data={data.liveClasses} columns={['title', 'link']} onDelete={deleteLiveClass} onRefresh={fetchData} />
                    </AdminSection>

                    <AdminSection title={t('manageNotifications')} icon={Bell}>
                         <CrudForm schema={notificationSchema} onSubmit={addNotification} onRefresh={fetchData} fields={{title: 'text', content: 'textarea'}} />
                         <DataTable data={data.notifications} columns={['title', 'content']} onDelete={deleteNotification} onRefresh={fetchData} />
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

                    <AdminSection title="Scholarship Applications" icon={GraduationCap}>
                        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Details</TableHead><TableHead>Docs</TableHead><TableHead>Applied On</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.scholarshipApps.map(app => (
                                    <TableRow key={app.id}><TableCell>{app.fullName}<br/><span className="text-muted-foreground text-xs">{app.fatherName}</span></TableCell><TableCell>{app.class}</TableCell><TableCell>UID: <span className="font-mono">{app.uniqueId}</span><br/>Mob: {app.mobile}</TableCell><TableCell className="flex gap-2"><ImagePreview url={app.photoUrl} triggerText="Photo" /><ImagePreview url={app.signatureUrl} triggerText="Sign" /></TableCell><TableCell>{format(app.createdAt.toDate(), 'PPP')}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AdminSection>

                    <AdminSection title="Registered Students" icon={Users}>
                       <Table><TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead>Registered On</TableHead></TableRow></TableHeader>
                           <TableBody>
                               {data.students.map(s => (
                                   <TableRow key={s.id}><TableCell><ImagePreview url={s.photoUrl} triggerText={<Image src={s.photoUrl || `https://placehold.co/40x40.png?text=${s.name[0]}`} alt="" width={40} height={40} className="rounded-full w-10 h-10 object-cover" data-ai-hint="student photo"/>} /></TableCell><TableCell>{s.name}<br/><span className="text-muted-foreground text-xs">{s.fatherName}</span></TableCell><TableCell>Class: {s.class}<br/>School: {s.school}</TableCell><TableCell>{format(s.createdAt.toDate(), 'PPP')}</TableCell></TableRow>
                               ))}
                           </TableBody>
                       </Table>
                    </AdminSection>

                </Accordion>
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

const CrudForm = ({ schema, onSubmit, onRefresh, fields }: { schema: z.ZodObject<any>, onSubmit: (data: any) => Promise<any>, onRefresh: () => void, fields: Record<string, 'text' | 'url' | 'textarea' | 'datetime-local' | 'file'> }) => {
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
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                    dataToSubmit[fieldName] = dataUrl;
                } else if (fields[fieldName] === 'file') {
                    // If file is optional and not provided, remove it from submission
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
                        <Input type="file" accept="image/*" {...form.register(fieldName)} disabled={isSubmitting}/> :
                        <Input type={fieldType} {...form.register(fieldName)} disabled={isSubmitting} />
                    }
                    <p className="text-destructive text-sm mt-1">{form.formState.errors[fieldName]?.message as string}</p>
                </div>
            ))}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('add')}</Button>
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
                    {columns.map(col => <TableCell key={col} className="truncate max-w-xs">{item[col]}</TableCell>)}
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
            <DialogContent>
                <DialogHeader><DialogTitle>Image Preview</DialogTitle></DialogHeader>
                <div className="flex justify-center p-4"><Image src={url} alt="Preview" width={400} height={400} className="max-w-full h-auto rounded-md" /></div>
            </DialogContent>
        </Dialog>
    );
};
