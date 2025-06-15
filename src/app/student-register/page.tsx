
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, UserPlus, LogIn } from 'lucide-react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formSchemaDefinition = (t: (key: any) => string) => z.object({
  displayName: z.string().min(2, { message: t('studentNameValidation') || "Name must be at least 2 characters."}),
  email: z.string().email({ message: t('emailValidation') || "Invalid email address." }),
  password: z.string().min(6, { message: t('passwordValidationMin') || "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: t('passwordValidationMin') || "Password must be at least 6 characters." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match", // TODO: Add to translations
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function StudentRegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleUserCreation = async (user: import('firebase/auth').User, additionalData?: { displayName?: string }) => {
    const userDocRef = doc(db, "students", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData?.displayName || "New User",
        photoURL: user.photoURL || null,
        createdAt: Timestamp.now(),
      });
    }
    toast({ title: t('registrationSuccess') });
    router.push('/profile');
  };

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.displayName });
      await handleUserCreation(userCredential.user, { displayName: data.displayName });
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: t('errorOccurred'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserCreation(result.user);
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: t('errorOccurred'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('studentRegisterTitle')}</CardTitle>
          <CardDescription>{t('studentRegisterDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {authError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('errorOccurred')}</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('studentName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('studentName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailAddress')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('emailAddress')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordLabel')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('confirmPasswordLabel')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? t('loading') : t('registerButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isLoading}>
             {/* Could add Google icon here */}
            {isLoading ? t('loading') : t('continueWithGoogle')}
          </Button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('alreadyHaveAccount')} <Link href="/student-login" className="font-semibold text-primary hover:underline">{t('loginButton')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
