
"use client";

import { useEffect, useState } from 'react';
import { useAuth, type StudentProfile } from '@/contexts/auth-context';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { UserCircle, LogOut, Edit3, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const profileFormSchemaDefinition = (t: (key: any) => string) => z.object({
  displayName: z.string().min(2, { message: t('studentNameValidation') || "Display name must be at least 2 characters." }),
  firstName: z.string().optional(),
  surname: z.string().optional(),
  fatherName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  currentClass: z.string().optional(),
});

type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchemaDefinition>>;

export default function ProfilePage() {
  const { user, studentData, setStudentData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentProfileFormSchema = profileFormSchemaDefinition(t);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(currentProfileFormSchema),
    defaultValues: {
      displayName: '',
      firstName: '',
      surname: '',
      fatherName: '',
      phoneNumber: '',
      address: '',
      state: '',
      country: '',
      currentClass: '',
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/student-login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (studentData) {
      form.reset({
        displayName: studentData.displayName || '',
        firstName: studentData.firstName || '',
        surname: studentData.surname || '',
        fatherName: studentData.fatherName || '',
        phoneNumber: studentData.phoneNumber || '',
        address: studentData.address || '',
        state: studentData.state || '',
        country: studentData.country || '',
        currentClass: studentData.currentClass || '',
      });
    }
  }, [studentData, form]);


  const handleLogout = async () => {
    await signOut(auth);
    setStudentData(null); // Clear student data on logout
    toast({ title: t('loggedOutSuccess') });
    router.push('/student-login');
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const studentDocRef = doc(db, "students", user.uid);
      const updatedProfileData: Partial<StudentProfile> = {
        ...data, // All fields from the form
        displayName: data.displayName, // ensure displayName is from form
        email: user.email, // email is not editable from this form
        photoURL: studentData?.photoURL || user.photoURL || null, // preserve existing photoURL
        updatedAt: Timestamp.now(),
      };

      // If it's a new profile, add createdAt
      const docSnap = await getDoc(studentDocRef);
      if (!docSnap.exists() || !docSnap.data()?.createdAt) {
        updatedProfileData.createdAt = Timestamp.now();
      }


      await setDoc(studentDocRef, updatedProfileData, { merge: true });
      
      // Update local studentData state
      setStudentData(prev => ({...(prev || {uid: user.uid, email:user.email}), ...updatedProfileData} as StudentProfile));

      toast({ title: t('profileUpdateSuccess') });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: t('errorOccurred'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src={studentData?.photoURL || user.photoURL || "https://placehold.co/128x128.png"}
              alt={t('profilePhotoAlt') || "Profile Photo"}
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-primary"
              data-ai-hint="person avatar"
            />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">
            {studentData?.displayName || user.displayName || t('studentProfileTitle')}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="displayName" render={({ field }) => (
                    <FormItem><FormLabel>{t('studentName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>{t('firstNameLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('firstNamePlaceholder')} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="surname" render={({ field }) => (
                    <FormItem><FormLabel>{t('surnameLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('surnamePlaceholder')} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fatherName" render={({ field }) => (
                    <FormItem><FormLabel>{t('fatherNameLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('fatherNamePlaceholder')} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" {...field} placeholder={t('phoneNumberPlaceholder')} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>{t('address')}</FormLabel><FormControl><Textarea {...field} placeholder={t('addressPlaceholder')} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem><FormLabel>{t('stateLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('statePlaceholder')} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormLabel>{t('countryLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('countryPlaceholder')} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="currentClass" render={({ field }) => (
                  <FormItem><FormLabel>{t('currentClass')}</FormLabel><FormControl><Input {...field} placeholder={t('currentClassPlaceholder')} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    {t('cancelButton')}
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                    {t('saveChangesButton')}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              {studentData?.firstName && <p><strong>{t('firstNameLabel')}:</strong> {studentData.firstName}</p>}
              {studentData?.surname && <p><strong>{t('surnameLabel')}:</strong> {studentData.surname}</p>}
              {studentData?.fatherName && <p><strong>{t('fatherNameLabel')}:</strong> {studentData.fatherName}</p>}
              {studentData?.phoneNumber && <p><strong>{t('phoneNumber')}:</strong> {studentData.phoneNumber}</p>}
              {studentData?.address && <p><strong>{t('address')}:</strong> {studentData.address}</p>}
              {studentData?.state && <p><strong>{t('stateLabel')}:</strong> {studentData.state}</p>}
              {studentData?.country && <p><strong>{t('countryLabel')}:</strong> {studentData.country}</p>}
              {studentData?.currentClass && <p><strong>{t('currentClass')}:</strong> {studentData.currentClass}</p>}
              
              {(!studentData?.firstName && !studentData?.surname && !studentData?.fatherName) && 
                <p className="text-muted-foreground">{t('profileNoDetails')}</p>
              }

              <Button onClick={() => setIsEditing(true)} className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Edit3 className="mr-2" />{t('editProfileButton')}
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={handleLogout} className="w-full mt-8">
            <LogOut className="mr-2"/> {t('logoutButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
