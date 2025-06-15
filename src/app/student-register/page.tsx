
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
import { AlertTriangle, UserPlus, Loader2 } from 'lucide-react';
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
        updatedAt: Timestamp.now(),
      });
    } else {
      // If user doc exists, perhaps update displayName if it changed or wasn't set
      const updateData: { displayName?: string; photoURL?: string | null; updatedAt: Timestamp } = { updatedAt: Timestamp.now() };
      if (user.displayName && user.displayName !== userDocSnap.data()?.displayName) {
        updateData.displayName = user.displayName;
      }
      if (user.photoURL && user.photoURL !== userDocSnap.data()?.photoURL) {
        updateData.photoURL = user.photoURL;
      }
      await setDoc(userDocRef, updateData, { merge: true });
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
      console.error("Firebase Registration Error:", error);
      const errorMessage = error.code ? `${error.message} (Code: ${error.code})` : error.message;
      setAuthError(errorMessage);
      toast({ title: t('errorOccurred'), description: errorMessage, variant: "destructive" });
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
      console.error("Google Sign-In Error (Register):", error);
      const errorMessage = error.code ? `${error.message} (Code: ${error.code})` : error.message;
      setAuthError(errorMessage);
      toast({ title: t('errorOccurred'), description: errorMessage, variant: "destructive" });
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
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" /> }
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.02h-2.75v2.03h4.41c1.87-1.68 2.66-4.36 2.66-7.21 0-.6-.05-1.18-.15-1.73H12.48zM1.07 22.05A12 12 0 0012.02 24c3.23 0 5.97-1.08 7.95-2.92l-4.41-2.03v-.01c-1.17.82-2.63 1.3-4.24 1.3-3.35 0-6.19-2.26-7.21-5.31H1.07v2.03zM12.02 0A12 12 0 001.37 3.02l3.34 2.54A7.17 7.17 0 0112.02 3c1.91 0 3.58.66 4.92 1.92L20.5 1.4A11.97 11.97 0 0012.02 0z"></path></svg>
            )}
            {isLoading ? t('loading') : t('continueWithGoogle')}
          </Button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/student-login" className="font-semibold text-primary hover:underline">
              {t('loginButton')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    