
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
import { addLiveClass, addNotification } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const liveClassSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    link: z.string().url("Must be a valid URL."),
    scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "A valid date and time must be selected.",
    }),
});

const notificationSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    content: z.string().min(10, "Content must be at least 10 characters."),
});

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isClassLoading, setIsClassLoading] = useState(false);
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const classForm = useForm<z.infer<typeof liveClassSchema>>({
        resolver: zodResolver(liveClassSchema),
        defaultValues: { title: "", link: "", scheduledAt: "" }
    });

    const notificationForm = useForm<z.infer<typeof notificationSchema>>({
        resolver: zodResolver(notificationSchema),
        defaultValues: { title: "", content: "" }
    });

    const handleAddClass = async (values: z.infer<typeof liveClassSchema>) => {
        setIsClassLoading(true);
        try {
            await addLiveClass(values);
            toast({ title: "Success", description: "Live class has been added successfully." });
            classForm.reset();
        } catch (error) {
            console.error("Error adding live class:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add live class." });
        } finally {
            setIsClassLoading(false);
        }
    };

    const handleAddNotification = async (values: z.infer<typeof notificationSchema>) => {
        setIsNotificationLoading(true);
        try {
            await addNotification(values);
            toast({ title: "Success", description: "Notification has been posted." });
            notificationForm.reset();
        } catch (error) {
            console.error("Error adding notification:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to post notification." });
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>

            <Tabs defaultValue="live-class" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live-class">Add Live Class</TabsTrigger>
                    <TabsTrigger value="notification">Add Notification</TabsTrigger>
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
                                    <Input id="class-title" {...classForm.register('title')} disabled={isClassLoading} />
                                    {classForm.formState.errors.title && <p className="text-destructive text-sm">{classForm.formState.errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link">Meeting Link</Label>
                                    <Input id="link" type="url" {...classForm.register('link')} disabled={isClassLoading} />
                                    {classForm.formState.errors.link && <p className="text-destructive text-sm">{classForm.formState.errors.link.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scheduledAt">Date and Time</Label>
                                    <Input id="scheduledAt" type="datetime-local" {...classForm.register('scheduledAt')} disabled={isClassLoading} />
                                    {classForm.formState.errors.scheduledAt && <p className="text-destructive text-sm">{classForm.formState.errors.scheduledAt.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isClassLoading}>
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
                                    <Input id="notification-title" {...notificationForm.register('title')} disabled={isNotificationLoading} />
                                    {notificationForm.formState.errors.title && <p className="text-destructive text-sm">{notificationForm.formState.errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea id="content" {...notificationForm.register('content')} disabled={isNotificationLoading} rows={5} />
                                    {notificationForm.formState.errors.content && <p className="text-destructive text-sm">{notificationForm.formState.errors.content.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isNotificationLoading}>
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
