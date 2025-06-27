
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
import { addLiveClass, addNotification, firebaseConfig } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from '@/components/ui/alert';

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

    const classForm = useForm<LiveClassFormValues>({
        resolver: zodResolver(liveClassSchema),
        defaultValues: { title: "", link: "", scheduledAt: "" }
    });

    const notificationForm = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: { title: "", content: "" }
    });

    const handleAddClass = async (values: LiveClassFormValues) => {
        setIsClassLoading(true);
        toast({ title: "Submitting...", description: "Adding live class to the database." });
        try {
            await addLiveClass(values);
            toast({ title: "Success", description: "Live class has been added successfully." });
            classForm.reset();
        } catch (error) {
            console.error("FULL ERROR object adding live class:", error);
            const errorMessage = (error as Error).message;
            const errorCode = (error as any).code;
            toast({ 
                variant: "destructive", 
                title: `Error: ${errorCode || 'Unknown Code'}`,
                description: `Failed: ${errorMessage}. Please check browser console.`,
                duration: 9000,
            });
        } finally {
            setIsClassLoading(false);
        }
    };

    const handleAddNotification = async (values: NotificationFormValues) => {
        setIsNotificationLoading(true);
        toast({ title: "Submitting...", description: "Adding notification to the database." });
        try {
            await addNotification(values);
            toast({ title: "Success", description: "Notification has been posted." });
            notificationForm.reset();
        } catch (error) {
            console.error("FULL ERROR object adding notification:", error);
            const errorMessage = (error as Error).message;
            const errorCode = (error as any).code;
            toast({ 
                variant: "destructive", 
                title: `Error: ${errorCode || 'Unknown Code'}`, 
                description: `Failed: ${errorMessage}. Please check browser console.`,
                duration: 9000,
            });
        } finally {
            setIsNotificationLoading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
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
                        Firebase is not connected. Features for adding classes and notifications are disabled. Please connect a Firebase project in the Studio UI.
                    </AlertDescription>
                </Alert>
            )}
            
            <Tabs defaultValue="live-class" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live-class" disabled={!isFirebaseConfigured}>Add Live Class</TabsTrigger>
                    <TabsTrigger value="notification" disabled={!isFirebaseConfigured}>Add Notification</TabsTrigger>
                </TabsList>

                <TabsContent value="live-class">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Live Class</CardTitle>
                        </CardHeader>
                        <form onSubmit={classForm.handleSubmit(handleAddClass)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="class-title">Class Title</Label>
                                    <Input id="class-title" {...classForm.register('title')} disabled={isFormDisabled} />
                                    {classForm.formState.errors.title && <p className="text-destructive text-sm">{classForm.formState.errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link">Meeting Link</Label>
                                    <Input id="link" type="url" {...classForm.register('link')} disabled={isFormDisabled} />
                                    {classForm.formState.errors.link && <p className="text-destructive text-sm">{classForm.formState.errors.link.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scheduledAt">Date and Time</Label>
                                    <Input id="scheduledAt" type="datetime-local" {...classForm.register('scheduledAt')} disabled={isFormDisabled} />
                                    {classForm.formState.errors.scheduledAt && <p className="text-destructive text-sm">{classForm.formState.errors.scheduledAt.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isFormDisabled}>
                                    {isClassLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Class
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="notification">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post a New Notification</CardTitle>
                        </CardHeader>
                        <form onSubmit={notificationForm.handleSubmit(handleAddNotification)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notification-title">Title</Label>
                                    <Input id="notification-title" {...notificationForm.register('title')} disabled={isFormDisabled} />
                                    {notificationForm.formState.errors.title && <p className="text-destructive text-sm">{notificationForm.formState.errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea id="content" {...notificationForm.register('content')} disabled={isFormDisabled} rows={5} />
                                    {notificationForm.formState.errors.content && <p className="text-destructive text-sm">{notificationForm.formState.errors.content.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isFormDisabled}>
                                    {isNotificationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Post Notification
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
