"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function StudentLoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { loginStudent } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit: SubmitHandler<LoginValues> = async (values) => {
        setIsLoading(true);
        // This is a mock login. In a real app, you'd verify credentials.
        const success = await loginStudent(values.username, values.password); 
        if (success) {
            toast({ title: "Login successful!" });
            router.push('/home');
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid username or password.",
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <UserCheck className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="mt-2 text-2xl">Student Login</CardTitle>
                    <CardDescription>Login to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t('fullName')}</Label>
                            <Input id="username" {...form.register('username')} disabled={isLoading} />
                            <p className="text-destructive text-xs">{form.formState.errors.username?.message}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...form.register('password')} disabled={isLoading} />
                            <p className="text-destructive text-xs">{form.formState.errors.password?.message}</p>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
