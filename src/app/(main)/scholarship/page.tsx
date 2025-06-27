
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Download, FileSignature, FileText, User, Mail, Phone, Home, School, Camera, Edit } from 'lucide-react';
import Image from 'next/image';

const SCHOLARSHIP_COLLECTION_NAME = "scholarshipApplications";

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  fullName: z.string().min(2, { message: t('studentNameValidation') }),
  fatherName: z.string().min(2, { message: t('fatherNameValidation') }),
  mobile: z.string().min(10, { message: t('phoneValidation') }),
  email: z.string().email({ message: t('emailValidation') }),
  age: z.coerce.number().positive({ message: t('ageValidation') }),
  currentClass: z.string().min(1, { message: t('classValidation') }),
  schoolName: z.string().min(3, { message: t('schoolNameValidation') }),
  fullAddress: z.string().min(10, { message: t('addressValidation') }),
  photo: z.string().optional(),
  signature: z.string().optional(),
});

type ScholarshipFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function ScholarshipPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ScholarshipFormValues | null>(null);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);
  
  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(formSchemaDefinition(t)),
    defaultValues: { fullName: "", fatherName: "", mobile: "", email: "", age: undefined, currentClass: "", schoolName: "", fullAddress: "" },
  });

  const onSubmit: SubmitHandler<ScholarshipFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const appNum = `GDA${Date.now()}${Math.floor(Math.random() * 100)}`;
      const payload = { ...data, applicationNumber: appNum, submissionDate: serverTimestamp() };
      
      await addDoc(collection(db, SCHOLARSHIP_COLLECTION_NAME), payload);
      
      setSubmittedData(data);
      setApplicationNumber(appNum);
      toast({ title: t('registrationSuccess'), description: t('registrationSuccessMessage') });
      form.reset();
    } catch (error: any) { 
      toast({
        title: t('errorOccurred'),
        description: t('saveErrorDetails'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderApplicationForm = () => (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-headline text-primary">{t('scholarshipRegistrationTitle')}</CardTitle>
        <CardDescription>{t('scholarshipFormDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel><User className="inline h-4 w-4 mr-1"/>{t('studentName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel><User className="inline h-4 w-4 mr-1"/>{t('fatherName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel><Phone className="inline h-4 w-4 mr-1"/>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel><Mail className="inline h-4 w-4 mr-1"/>{t('emailAddress')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>{t('age')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="currentClass" render={({ field }) => (<FormItem><FormLabel>{t('currentClass')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="schoolName" render={({ field }) => (<FormItem><FormLabel><School className="inline h-4 w-4 mr-1"/>{t('schoolName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="fullAddress" render={({ field }) => (<FormItem><FormLabel><Home className="inline h-4 w-4 mr-1"/>{t('address')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            {/* Simple file inputs for prototype; real implementation would need storage upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="photo" render={({ field }) => (<FormItem><FormLabel><Camera className="inline h-4 w-4 mr-1"/>{t('passportPhoto')}</FormLabel><FormControl><Input type="file" accept="image/*" /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="signature" render={({ field }) => (<FormItem><FormLabel><Edit className="inline h-4 w-4 mr-1"/>{t('signature')}</FormLabel><FormControl><Input type="file" accept="image/*" /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('loading')}</>) : t('submitRegistration')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderConfirmation = () => (
    <Card className="shadow-xl" id="confirmation-certificate">
       <CardHeader className="text-center bg-primary text-primary-foreground p-4 rounded-t-lg">
        <CardTitle className="text-2xl font-bold font-headline">{t('applicationConfirmation')}</CardTitle>
        <CardDescription className="text-primary-foreground/80">{t('applicationConfirmationDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
            <p className="text-muted-foreground">{t('applicationNumber')}</p>
            <p className="text-2xl font-bold text-primary font-mono">{applicationNumber}</p>
        </div>
        <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
            <div><p className="font-semibold text-muted-foreground">{t('studentName')}</p><p>{submittedData?.fullName}</p></div>
            <div><p className="font-semibold text-muted-foreground">{t('fatherName')}</p><p>{submittedData?.fatherName}</p></div>
            <div><p className="font-semibold text-muted-foreground">{t('phoneNumber')}</p><p>{submittedData?.mobile}</p></div>
            <div><p className="font-semibold text-muted-foreground">{t('currentClass')}</p><p>{submittedData?.currentClass}</p></div>
            <div className="col-span-2"><p className="font-semibold text-muted-foreground">{t('address')}</p><p>{submittedData?.fullAddress}</p></div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 p-4">
         <Button onClick={() => window.print()} className="w-full bg-accent text-accent-foreground">
          <Download className="mr-2 h-4 w-4" /> {t('downloadConfirmation')}
        </Button>
        <Button variant="outline" onClick={() => setSubmittedData(null)} className="w-full">
          {t('newApplication')}
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderAdmitCardDownloader = () => (
    <Card>
        <CardHeader>
            <CardTitle>{t('downloadAdmitCard')}</CardTitle>
            <CardDescription>{t('downloadAdmitCardDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="appNumber">{t('applicationNumber')}</Label>
                <Input id="appNumber" placeholder="GDA..." />
            </div>
             <div>
                <Label htmlFor="uniqueId">{t('uniqueId')}</Label>
                <Input id="uniqueId" placeholder={t('paymentIdPlaceholder')} />
            </div>
            <Button className="w-full bg-accent text-accent-foreground">{t('submitButton')}</Button>
        </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="application_form" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="application_form"><FileSignature className="mr-2 h-4 w-4"/>{t('scholarshipForm')}</TabsTrigger>
                <TabsTrigger value="admit_card"><FileText className="mr-2 h-4 w-4"/>{t('admitCard')}</TabsTrigger>
            </TabsList>
            <TabsContent value="application_form" className="mt-6">
                 {submittedData ? renderConfirmation() : renderApplicationForm()}
            </TabsContent>
            <TabsContent value="admit_card" className="mt-6">
                {renderAdmitCardDownloader()}
            </TabsContent>
        </Tabs>
    </div>
  );
}
