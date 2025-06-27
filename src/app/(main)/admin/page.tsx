
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addLiveClass } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    link: z.string().url("Must be a valid URL."),
    scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "A valid date and time must be selected.",
    }),
});

export default function AdminPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { admin, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            link: "",
            scheduledAt: "",
        }
    });

    const handleAddClass = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await addLiveClass(values);
            toast({
                title: "Success",
                description: "Live class has been added successfully.",
            });
            form.reset();
        } catch (error) {
            console.error("Error adding live class:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add live class. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!admin) {
        router.replace('/admin-login');
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Live Class</CardTitle>
                </CardHeader>
                <form onSubmit={form.handleSubmit(handleAddClass)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Class Title</Label>
                            <Input id="title" {...form.register('title')} disabled={isLoading} />
                            {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Meeting Link (Zoom, Meet, etc.)</Label>
                            <Input id="link" type="url" {...form.register('link')} disabled={isLoading} />
                            {form.formState.errors.link && <p className="text-destructive text-sm">{form.formState.errors.link.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scheduledAt">Date and Time</Label>
                            <Input id="scheduledAt" type="datetime-local" {...form.register('scheduledAt')} disabled={isLoading} />
                            {form.formState.errors.scheduledAt && <p className="text-destructive text-sm">{form.formState.errors.scheduledAt.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Add Class
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
