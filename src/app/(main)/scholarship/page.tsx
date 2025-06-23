
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const SCHOLARSHIP_COLLECTION_NAME = "scholarshipRegistrations";

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  studentName: z.string().min(2, { message: t('studentNameValidation') || "Name must be at least 2 characters." }),
  emailAddress: z.string().email({ message: t('emailValidation') || "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: t('phoneValidation') || "Phone number must be at least 10 digits." }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') || "Invalid characters in phone number." }),
  currentClass: z.string().min(1, { message: t('classValidation') || "Current class is required." }),
  address: z.string().min(5, { message: t('addressValidation') || "Address must be at least 5 characters." }),
});

type ScholarshipFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function ScholarshipPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: { studentName: "", emailAddress: "", phoneNumber: "", currentClass: "", address: "" },
  });

  const onSubmit: SubmitHandler<ScholarshipFormValues> = async (data) => {
    console.log("ScholarshipPage: Attempting to submit scholarship registration. Form data:", JSON.parse(JSON.stringify(data)));
    setIsSubmitting(true);
    try {
      const newRegistration = { ...data, registrationDate: serverTimestamp() };
      console.log("ScholarshipPage: New scholarship registration PAYLOAD for Firestore:", JSON.parse(JSON.stringify(newRegistration)));

      const docRef = await addDoc(collection(db, SCHOLARSHIP_COLLECTION_NAME), newRegistration);
      console.log("ScholarshipPage: Scholarship registration added to Firestore successfully. Collection:", SCHOLARSHIP_COLLECTION_NAME, "Document ID:", docRef.id);
      
      toast({ title: t('registrationSuccess'), description: t('registrationSuccessMessage') });
      form.reset();
    } catch (error: any) { 
      console.error("ScholarshipPage: ERROR adding scholarship registration to Firestore.", {
        collection: SCHOLARSHIP_COLLECTION_NAME,
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error
      });
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails') || "Could not save registration."} ${error.message ? `(${error.message})` : "Please check console and Firebase setup."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("ScholarshipPage: Finished scholarship registration submit attempt.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('scholarshipRegistrationTitle')}</CardTitle>
          <CardDescription>{t('scholarshipFormDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="studentName" render={({ field }) => (<FormItem><FormLabel>{t('studentName')}</FormLabel><FormControl><Input placeholder={t('studentName')} {...field} className="h-12"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="emailAddress" render={({ field }) => (<FormItem><FormLabel>{t('emailAddress')}</FormLabel><FormControl><Input type="email" placeholder={t('emailAddress')} {...field} className="h-12"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" placeholder={t('phoneNumber')} {...field} className="h-12"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="currentClass" render={({ field }) => (<FormItem><FormLabel>{t('currentClass')}</FormLabel><FormControl><Input placeholder={t('currentClass')} {...field} className="h-12"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>{t('address')}</FormLabel><FormControl><Textarea placeholder={t('address')} {...field} className="min-h-[100px]"/></FormControl><FormMessage /></FormItem>)}/>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-14" disabled={isSubmitting}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('loading')}</>) : t('submitRegistration')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
