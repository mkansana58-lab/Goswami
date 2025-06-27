
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addLiveClass, addNotification, firebaseConfig, getScholarshipApplications, getStudents, type ScholarshipApplicationData, type StudentData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

const liveClassSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    link: z.string().url("Must be a valid URL."),
    scheduledAt: z.string().min(1, { message: "A valid date and time must be selected." }),
});

const notificationSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    content: z.string().min(10, "Content must be at least 10 characters."),
});

type LiveClassFormValues = z.infer<typeof liveClassSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isClassLoading, setIsClassLoading] = useState(false);
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const isFirebaseConfigured = !!firebaseConfig.projectId;
    
    const [scholarshipApps, setScholarshipApps] = useState<ScholarshipApplicationData[]>([]);
    const [students, setStudents] = useState<StudentData[]>([]);
    const [isAppsLoading, setIsAppsLoading] = useState(false);
    const [isStudentsLoading, setIsStudentsLoading] = useState(false);

    const classForm = useForm<LiveClassFormValues>({
        resolver: zodResolver(liveClassSchema),
        defaultValues: { title: "", link: "", scheduledAt: "" }
    });

    const notificationForm = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: { title: "", content: "" }
    });

    const handleTabChange = async (value: string) => {
        if (!isFirebaseConfigured) return;

        if (value === 'scholarship-apps' && scholarshipApps.length === 0) {
            setIsAppsLoading(true);
            try {
                const data = await getScholarshipApplications();
                setScholarshipApps(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load scholarship applications.' });
            } finally {
                setIsAppsLoading(false);
            }
        } else if (value === 'students' && students.length === 0) {
            setIsStudentsLoading(true);
            try {
                const data = await getStudents();
                setStudents(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load students.' });
            } finally {
                setIsStudentsLoading(false);
            }
        }
    };
    
    const handleAddClass = async (values: LiveClassFormValues) => {
        setIsClassLoading(true);
        try {
            await addLiveClass(values);
            toast({ title: "Success", description: "Live class has been added." });
            classForm.reset();
        } catch (error) {
            console.error("Error adding live class:", error);
            toast({ variant: "destructive", title: "Error", description: `Failed to add class: ${(error as Error).message}` });
        } finally {
            setIsClassLoading(false);
        }
    };
    
    const handleAddNotification = async (values: NotificationFormValues) => {
        setIsNotificationLoading(true);
        try {
            await addNotification(values);
            toast({ title: "Success", description: "Notification has been posted." });
            notificationForm.reset();
        } catch (error) {
            console.error("Error adding notification:", error);
            toast({ variant: "destructive", title: "Error", description: `Failed to add notification: ${(error as Error).message}` });
        } finally {
            setIsNotificationLoading(false);
        }
    };

    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!admin) {
        router.replace('/admin-login');
        return null;
    }
    
    const isFormDisabled = !isFirebaseConfigured || isClassLoading || isNotificationLoading;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>

            {!isFirebaseConfigured && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Firebase is not connected. Features are disabled.
                    </AlertDescription>
                </Alert>
            )}
            
            <Tabs defaultValue="live-class" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="live-class" disabled={!isFirebaseConfigured}>Add Class</TabsTrigger>
                    <TabsTrigger value="notification" disabled={!isFirebaseConfigured}>Add Notification</TabsTrigger>
                    <TabsTrigger value="scholarship-apps" disabled={!isFirebaseConfigured}>Scholarship Apps</TabsTrigger>
                    <TabsTrigger value="students" disabled={!isFirebaseConfigured}>Students</TabsTrigger>
                </TabsList>

                <TabsContent value="live-class">
                    <Card><CardHeader><CardTitle>Add New Live Class</CardTitle></CardHeader>
                        <form onSubmit={classForm.handleSubmit(handleAddClass)}>
                            <CardContent className="space-y-4">
                                <div><Label>Title</Label><Input {...classForm.register('title')} disabled={isFormDisabled} />{classForm.formState.errors.title && <p className="text-destructive text-sm">{classForm.formState.errors.title.message}</p>}</div>
                                <div><Label>Link</Label><Input type="url" {...classForm.register('link')} disabled={isFormDisabled} />{classForm.formState.errors.link && <p className="text-destructive text-sm">{classForm.formState.errors.link.message}</p>}</div>
                                <div><Label>Date & Time</Label><Input type="datetime-local" {...classForm.register('scheduledAt')} disabled={isFormDisabled} />{classForm.formState.errors.scheduledAt && <p className="text-destructive text-sm">{classForm.formState.errors.scheduledAt.message}</p>}</div>
                            </CardContent>
                            <CardFooter><Button type="submit" disabled={isFormDisabled}>{isClassLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Class</Button></CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="notification">
                    <Card><CardHeader><CardTitle>Post a New Notification</CardTitle></CardHeader>
                        <form onSubmit={notificationForm.handleSubmit(handleAddNotification)}>
                            <CardContent className="space-y-4">
                                <div><Label>Title</Label><Input {...notificationForm.register('title')} disabled={isFormDisabled} />{notificationForm.formState.errors.title && <p className="text-destructive text-sm">{notificationForm.formState.errors.title.message}</p>}</div>
                                <div><Label>Content</Label><Textarea {...notificationForm.register('content')} disabled={isFormDisabled} />{notificationForm.formState.errors.content && <p className="text-destructive text-sm">{notificationForm.formState.errors.content.message}</p>}</div>
                            </CardContent>
                            <CardFooter><Button type="submit" disabled={isFormDisabled}>{isNotificationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Post Notification</Button></CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="scholarship-apps">
                    <Card><CardHeader><CardTitle>Scholarship Applications</CardTitle></CardHeader>
                        <CardContent>
                            {isAppsLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                                <Table>
                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Mobile</TableHead><TableHead>Applied On</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {scholarshipApps.map(app => (
                                            <TableRow key={app.id}><TableCell>{app.fullName}</TableCell><TableCell>{app.class}</TableCell><TableCell>{app.mobile}</TableCell><TableCell>{format(app.createdAt.toDate(), 'PPP')}</TableCell></TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card><CardHeader><CardTitle>Registered Students</CardTitle></CardHeader>
                        <CardContent>
                            {isStudentsLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                                <Table>
                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Registered On</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id}><TableCell>{student.name}</TableCell><TableCell>{format(student.createdAt.toDate(), 'PPP')}</TableCell></TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
