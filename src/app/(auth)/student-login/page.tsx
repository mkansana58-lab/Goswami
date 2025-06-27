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
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schemas
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
    name: z.string().min(3, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters."),
    fatherName: z.string().min(3, "Father's name is required"),
    class: z.string().min(1, "Class is required"),
    age: z.coerce.number().min(8, "Age must be at least 8"),
    address: z.string().min(10, "Full address is required"),
    school: z.string().min(3, "School name is required"),
    photo: z.any().refine((files) => files?.length === 1, "Photo is required."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

// Login Form Component
const LoginForm = () => {
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
    );
};

// Register Form Component
const RegisterForm = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { registerStudent } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", password: "", fatherName: "", class: "", age: undefined, address: "", school: "" }
    });
    
    const onSubmit: SubmitHandler<RegisterValues> = async (values) => {
        setIsLoading(true);
        const { photo, ...dataToRegister } = values;
        const photoFile = photo[0];

        try {
            const success = await registerStudent(dataToRegister, photoFile);
            if (success) {
                toast({ title: "Registration successful!" });
                router.push('/home');
            } else {
                throw new Error("Registration failed.");
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "This username might already be taken.",
            });
        }
        setIsLoading(false);
    };

    return (
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>{t('fullName')}</Label><Input {...form.register('name')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.name?.message}</p></div>
                <div><Label>Password</Label><Input type="password" {...form.register('password')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.password?.message}</p></div>
                <div><Label>{t('fathersName')}</Label><Input {...form.register('fatherName')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p></div>
                <div><Label>{t('selectClass')}</Label><Input {...form.register('class')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.class?.message}</p></div>
                <div><Label>{t('age')}</Label><Input type="number" {...form.register('age')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.age?.message}</p></div>
                <div><Label>{t('schoolName')}</Label><Input {...form.register('school')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.school?.message}</p></div>
                <div className="md:col-span-2"><Label>{t('fullAddress')}</Label><Input {...form.register('address')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.address?.message}</p></div>
                <div className="md:col-span-2"><Label>{t('profilePhoto')}</Label><Input type="file" accept="image/*" {...form.register('photo')} disabled={isLoading} /><p className="text-destructive text-xs">{form.formState.errors.photo?.message as string}</p></div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 'Register'}
            </Button>
        </form>
    );
};

// Main Page Component
export default function StudentLoginPage() {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                 <Tabs defaultValue="login" className="w-full">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login"><UserCheck className="mr-2 h-4 w-4"/> Login</TabsTrigger>
                            <TabsTrigger value="register"><UserPlus className="mr-2 h-4 w-4"/> Register</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="login">
                            <CardTitle className="mb-1 text-center">Student Login</CardTitle>
                            <CardDescription className="mb-4 text-center">Login to access your dashboard.</CardDescription>
                            <LoginForm />
                        </TabsContent>
                        <TabsContent value="register">
                            <CardTitle className="mb-1 text-center">New Student Registration</CardTitle>
                            <CardDescription className="mb-4 text-center">Create your account to get started.</CardDescription>
                            <RegisterForm />
                        </TabsContent>
                    </CardContent>
                 </Tabs>
            </Card>
        </div>
    );
}
