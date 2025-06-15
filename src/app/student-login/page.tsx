
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
import { AlertTriangle, LogIn } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formSchemaDefinition = (t: (key: any) => string) => z.object({
  email: z.string().email({ message: t('emailValidation') || "Invalid email address." }),
  password: z.string().min(1, { message: t('passwordLabel') + " " + (t('validationRequired') || "is required.") }),
});

type LoginFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function StudentLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserLoginSuccess = async (user: import('firebase/auth').User) => {
    // Ensure user profile exists in Firestore, especially for Google Sign-In
    const userDocRef = doc(db, "students", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // This case is more relevant for Google Sign-in where a user might log in
      // without having gone through the app's specific registration flow that creates the doc.
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "New User",
        photoURL: user.photoURL || null,
        createdAt: Timestamp.now(),
      });
    }
    toast({ title: t('loginSuccess') });
    router.push('/profile'); // Or homepage
  };

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await handleUserLoginSuccess(userCredential.user);
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
      await handleUserLoginSuccess(result.user);
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
            <LogIn className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('studentLoginTitle')}</CardTitle>
          <CardDescription>{t('studentLoginDesc')}</CardDescription>
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
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? t('loading') : t('loginButton')}
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
            {t('dontHaveAccount')}{' '}
            <Link href="/student-register" className="font-semibold text-primary hover:underline">
              {t('registerButton')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
