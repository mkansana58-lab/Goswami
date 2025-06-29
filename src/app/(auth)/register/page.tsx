
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth, type RegisterValues } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

const registerSchema = z.object({
    username: z.string().min(3, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fatherName: z.string().min(3, "Father's name is required"),
    class: z.string().min(1, "Class is required"),
    age: z.coerce.number().min(8, "Age must be at least 8"),
    address: z.string().min(10, "Full address is required"),
    school: z.string().min(3, "School name is required"),
    photo: z.any().optional(),
});

export default function RegisterPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { registerStudent } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit: SubmitHandler<RegisterValues> = async (values) => {
        setIsLoading(true);
        const success = await registerStudent(values);
        if (success) {
            toast({ title: "Registration successful!" });
            router.push('/home');
        } else {
             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "An unexpected error occurred. Please try again.",
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                 <CardHeader className="text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="mt-2 text-2xl text-primary">Create an Account</CardTitle>
                    <CardDescription>Register to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>{t('fullName')}</Label><Input {...form.register('username')} /><p className="text-destructive text-xs">{form.formState.errors.username?.message}</p></div>
                            <div><Label>Password</Label><Input type="password" {...form.register('password')} /><p className="text-destructive text-xs">{form.formState.errors.password?.message}</p></div>
                            <div><Label>{t('fathersName')}</Label><Input {...form.register('fatherName')} /><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p></div>
                            <div><Label>{t('selectClass')}</Label><Input {...form.register('class')} /><p className="text-destructive text-xs">{form.formState.errors.class?.message}</p></div>
                            <div><Label>{t('age')}</Label><Input type="number" {...form.register('age')} /><p className="text-destructive text-xs">{form.formState.errors.age?.message}</p></div>
                            <div><Label>{t('schoolName')}</Label><Input {...form.register('school')} /><p className="text-destructive text-xs">{form.formState.errors.school?.message}</p></div>
                            <div className="md:col-span-2"><Label>{t('fullAddress')}</Label><Input {...form.register('address')} /><p className="text-destructive text-xs">{form.formState.errors.address?.message}</p></div>
                            <div className="md:col-span-2">
                                <Label htmlFor="photo">{t('profilePhoto')} (Optional)</Label>
                                <Input id="photo" type="file" accept="image/*" {...form.register('photo')} />
                                <p className="text-destructive text-xs">{form.formState.errors.photo?.message as string}</p>
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 'Register'}
                        </Button>
                         <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/student-login" className="font-semibold text-primary hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
