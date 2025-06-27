
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { STUDENT_LOGGED_IN_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import type { StudentProfileData } from '../student-profile/page'; 
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('studentNameValidation') }),
  mobile: z.string().min(10, { message: t('phoneValidation') }),
  email: z.string().email({ message: t('emailValidation') }).optional().or(z.literal('')),
  city: z.string().min(2, { message: t('cityValidation') }),
  state: z.string().min(2, { message: t('stateValidation') }),
  pincode: z.string().min(6, { message: t('pincodeValidation') }).max(6, { message: t('pincodeValidation') }),
  currentClass: z.string().min(1, { message: t('classValidation') }),
  exam: z.string().min(2, { message: t('examValidation') }),
});

type LoginFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;


export default function StudentLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true') {
      router.push('/');
    }
  }, [router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchemaDefinition(t)),
    defaultValues: {
      name: '', mobile: '', email: '', city: '', state: '', pincode: '', currentClass: '', exam: ''
    }
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    
    // Save to Firebase `students` collection
    try {
        await addDoc(collection(db, "students"), {
            ...data,
            registeredAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to save student registration to Firebase:", error);
        // We can still proceed with local login even if Firebase fails
    }

    // Create a dummy profile for local use
    const profile: StudentProfileData = {
        name: data.name,
        email: data.email || `${data.mobile}@example.com`,
        mobile: data.mobile,
        currentClass: data.currentClass,
        address: `${data.city}, ${data.state}, ${data.pincode}`,
        photoDataUrl: "https://placehold.co/150x150.png",
        dataAiHint: "student avatar",
        enrolledCourses: [
            { id: "SAMPLE001", titleKey: "sainikSchoolCourseTitle", progress: 0, descriptionKey: "sainikSchoolCourseDesc" },
        ]
    };

    localStorage.setItem(STUDENT_LOGGED_IN_KEY, 'true');
    localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify(profile));
    
    toast({ title: t('loginSuccessTitle'), description: t('loginSuccessMessageStudent')});
    window.dispatchEvent(new Event('storage')); // Notify other components of auth change
    router.push('/');

    setIsLoading(false);
  };

  if (!isClient) {
    return (
       <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border/50">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-3">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('appName')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('studentLoginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('studentName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('emailAddress')} ({t('optional')})</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t('city')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>{t('state')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>{t('pincode')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currentClass" render={({ field }) => (<FormItem><FormLabel>{t('currentClass')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="exam" render={({ field }) => (<FormItem><FormLabel>{t('examToPrepare')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

              <Button type="submit" className="w-full h-12 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5"/>}
                {t('loginAndRegister')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
