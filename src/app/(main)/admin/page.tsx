"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addLiveClass, addNotification, getScholarshipApplications, getStudents, updateAppConfig, getAppConfig, type AppConfig, type ScholarshipApplicationData, type StudentData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Settings, Tv, Bell, GraduationCap, Users, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { format, toDate } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


// Schemas
const liveClassSchema = z.object({ title: z.string().min(5), link: z.string().url(), scheduledAt: z.string().min(1) });
const notificationSchema = z.object({ title: z.string().min(5), content: z.string().min(10) });
const settingsSchema = z.object({
    scholarshipDeadline: z.string().optional(),
    examDate: z.string().optional(),
    admitCardDownloadStartDate: z.string().optional(),
});

type LiveClassForm = z.infer<typeof liveClassSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;
type SettingsForm = z.infer<typeof settingsSchema>;

// Helper to format timestamp for datetime-local input
const toInputDateTimeFormat = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "";
    const date = toDate(timestamp);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState({ class: false, notification: false, settings: false, apps: false, students: false });
    const [scholarshipApps, setScholarshipApps] = useState<ScholarshipApplicationData[]>([]);
    const [students, setStudents] = useState<StudentData[]>([]);

    const classForm = useForm<LiveClassForm>({ resolver: zodResolver(liveClassSchema) });
    const notificationForm = useForm<NotificationForm>({ resolver: zodResolver(notificationSchema) });
    const settingsForm = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });

    useEffect(() => {
        setIsLoading(prev => ({ ...prev, settings: true }));
        getAppConfig().then(config => {
            settingsForm.reset({
                scholarshipDeadline: toInputDateTimeFormat(config.scholarshipDeadline),
                examDate: toInputDateTimeFormat(config.examDate),
                admitCardDownloadStartDate: toInputDateTimeFormat(config.admitCardDownloadStartDate),
            });
        }).finally(() => setIsLoading(prev => ({ ...prev, settings: false })));
    }, [settingsForm]);

    const handleTabChange = async (value: string) => {
        if (value === 'scholarship-apps' && scholarshipApps.length === 0) {
            setIsLoading(prev => ({ ...prev, apps: true }));
            getScholarshipApplications().then(setScholarshipApps).finally(() => setIsLoading(prev => ({ ...prev, apps: false })));
        } else if (value === 'students' && students.length === 0) {
            setIsLoading(prev => ({ ...prev, students: true }));
            getStudents().then(setStudents).finally(() => setIsLoading(prev => ({ ...prev, students: false })));
        }
    };
    
    const handleAction = async (action: () => Promise<void>, type: 'class' | 'notification' | 'settings', form: any) => {
        setIsLoading(prev => ({ ...prev, [type]: true }));
        try {
            await action();
            toast({ title: "Success", description: "Action completed successfully." });
            if (type !== 'settings') form.reset();
        } catch (error) {
            const err = error as Error;
            toast({ variant: "destructive", title: "Error", description: err.message });
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSaveSettings = (values: SettingsForm) => {
        const configData: AppConfig = {
            ...(values.scholarshipDeadline && { scholarshipDeadline: Timestamp.fromDate(new Date(values.scholarshipDeadline)) }),
            ...(values.examDate && { examDate: Timestamp.fromDate(new Date(values.examDate)) }),
            ...(values.admitCardDownloadStartDate && { admitCardDownloadStartDate: Timestamp.fromDate(new Date(values.admitCardDownloadStartDate)) }),
        };
        handleAction(() => updateAppConfig(configData), 'settings', settingsForm);
    };

    if (isAuthLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!admin) { router.replace('/admin-login'); return null; }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
            
            <Tabs defaultValue="scholarship-apps" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="scholarship-apps"><GraduationCap className="w-4 h-4 mr-2" />Apps</TabsTrigger>
                    <TabsTrigger value="students"><Users className="w-4 h-4 mr-2" />Students</TabsTrigger>
                    <TabsTrigger value="live-class"><Tv className="w-4 h-4 mr-2" />Classes</TabsTrigger>
                    <TabsTrigger value="notification"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scholarship-apps"><Card><CardHeader><CardTitle>Scholarship Applications</CardTitle></CardHeader><CardContent>
                    {isLoading.apps ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Details</TableHead><TableHead>Docs</TableHead><TableHead>Applied On</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {scholarshipApps.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell>{app.fullName}<br/><span className="text-muted-foreground text-xs">{app.fatherName}</span></TableCell>
                                        <TableCell>{app.class}</TableCell>
                                        <TableCell>UID: <span className="font-mono">{app.uniqueId}</span><br/>Mob: {app.mobile}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <ImagePreview url={app.photoUrl} triggerText="Photo" />
                                            <ImagePreview url={app.signatureUrl} triggerText="Sign" />
                                        </TableCell>
                                        <TableCell>{format(app.createdAt.toDate(), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>}
                </CardContent></Card></TabsContent>
                
                <TabsContent value="students"><Card><CardHeader><CardTitle>Registered Students</CardTitle></CardHeader><CardContent>
                    {isLoading.students ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                        <Table><TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead>Registered On</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {students.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell><ImagePreview url={s.photoUrl} triggerText={<Image src={s.photoUrl || ''} alt="" width={40} height={40} className="rounded-full w-10 h-10 object-cover" data-ai-hint="student photo"/>} /></TableCell>
                                        <TableCell>{s.name}<br/><span className="text-muted-foreground text-xs">{s.fatherName}</span></TableCell>
                                        <TableCell>Class: {s.class}<br/>School: {s.school}</TableCell>
                                        <TableCell>{format(s.createdAt.toDate(), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>}
                </CardContent></Card></TabsContent>
                
                <TabsContent value="live-class"><Card><CardHeader><CardTitle>Add New Live Class</CardTitle></CardHeader>
                    <form onSubmit={classForm.handleSubmit(v => handleAction(() => addLiveClass(v), 'class', classForm))}>
                        <CardContent className="space-y-4">
                            <div><Label>Title</Label><Input {...classForm.register('title')} disabled={isLoading.class} /><p className="text-destructive text-sm">{classForm.formState.errors.title?.message}</p></div>
                            <div><Label>Link</Label><Input type="url" {...classForm.register('link')} disabled={isLoading.class} /><p className="text-destructive text-sm">{classForm.formState.errors.link?.message}</p></div>
                            <div><Label>Date & Time</Label><Input type="datetime-local" {...classForm.register('scheduledAt')} disabled={isLoading.class} /><p className="text-destructive text-sm">{classForm.formState.errors.scheduledAt?.message}</p></div>
                        </CardContent>
                        <CardFooter><Button type="submit" disabled={isLoading.class}>{isLoading.class && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Class</Button></CardFooter>
                    </form>
                </Card></TabsContent>
                
                <TabsContent value="notification"><Card><CardHeader><CardTitle>Post a New Notification</CardTitle></CardHeader>
                    <form onSubmit={notificationForm.handleSubmit(v => handleAction(() => addNotification(v), 'notification', notificationForm))}>
                        <CardContent className="space-y-4">
                            <div><Label>Title</Label><Input {...notificationForm.register('title')} disabled={isLoading.notification} /><p className="text-destructive text-sm">{notificationForm.formState.errors.title?.message}</p></div>
                            <div><Label>Content</Label><Textarea {...notificationForm.register('content')} disabled={isLoading.notification} /><p className="text-destructive text-sm">{notificationForm.formState.errors.content?.message}</p></div>
                        </CardContent>
                        <CardFooter><Button type="submit" disabled={isLoading.notification}>{isLoading.notification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Post</Button></CardFooter>
                    </form>
                </Card></TabsContent>
                
                <TabsContent value="settings"><Card><CardHeader><CardTitle>Academy Settings</CardTitle><CardDescription>Manage important dates and deadlines for the academy.</CardDescription></CardHeader>
                    <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)}>
                        <CardContent className="space-y-4">
                            <div><Label>{t('scholarshipDeadline')}</Label><Input type="datetime-local" {...settingsForm.register('scholarshipDeadline')} disabled={isLoading.settings} /></div>
                            <div><Label>{t('examDate')}</Label><Input type="datetime-local" {...settingsForm.register('examDate')} disabled={isLoading.settings} /></div>
                            <div><Label>{t('admitCardStartDate')}</Label><Input type="datetime-local" {...settingsForm.register('admitCardDownloadStartDate')} disabled={isLoading.settings} /></div>
                        </CardContent>
                        <CardFooter><Button type="submit" disabled={isLoading.settings}>{isLoading.settings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('saveSettings')}</Button></CardFooter>
                    </form>
                </Card></TabsContent>
            </Tabs>
        </div>
    );
}

const ImagePreview = ({ url, triggerText }: { url?: string; triggerText: React.ReactNode }) => {
    if (!url) return <span className="text-xs text-muted-foreground">N/A</span>;
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-1">{triggerText}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Image Preview</AlertDialogTitle></AlertDialogHeader>
                <div className="flex justify-center p-4">
                    <Image src={url} alt="Preview" width={400} height={400} className="max-w-full h-auto rounded-md" />
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
