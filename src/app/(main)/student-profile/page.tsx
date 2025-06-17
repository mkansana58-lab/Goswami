
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User, Camera, Home, Phone, Mail, Loader2, ShieldAlert, LogOut, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { STUDENT_LOGGED_IN_KEY, STUDENT_USERNAME_KEY } from '../student-login/page';

export const STUDENT_PROFILE_LOCALSTORAGE_KEY = 'studentProfileGoSwami'; // For caching name/photo

const profileFormSchemaDefinition = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('studentNameValidation') }),
  photoDataUrl: z.string().optional(), // Storing photo as Data URL
  address: z.string().min(5, { message: t('addressValidation') }),
  mobile: z.string().min(10, { message: t('phoneValidation') }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') }),
  email: z.string().email({ message: t('emailValidation') }),
});

type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchemaDefinition>>;

const STUDENT_PROFILES_COLLECTION = 'studentProfiles';

export default function StudentProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStudentUsername, setCurrentStudentUsername] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const currentFormSchema = profileFormSchemaDefinition(t);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: { name: "", photoDataUrl: "", address: "", mobile: "", email: "" },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      const username = localStorage.getItem(STUDENT_USERNAME_KEY);
      if (!isLoggedIn || !username) {
        router.replace('/student-login');
      } else {
        setCurrentStudentUsername(username);
        fetchProfile(username);
      }
    }
  }, [router]);

  const fetchProfile = async (username: string) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, STUDENT_PROFILES_COLLECTION, username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ProfileFormValues;
        form.reset(data);
        if (data.photoDataUrl) {
          setPhotoPreview(data.photoDataUrl);
        }
        // Update localStorage cache for header
        localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify({ name: data.name, photoDataUrl: data.photoDataUrl }));

      } else {
        // If no profile, but username exists (e.g. from student_login page), prefill email with dummy
        form.setValue('email', `${username}@example.com`); 
        console.log("No such profile document! Initializing form.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: t('errorOccurred'), description: t('fetchErrorDetails'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoPreview(dataUrl);
        form.setValue('photoDataUrl', dataUrl); // Set for form submission
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentStudentUsername) return;
    setIsSaving(true);
    try {
      const profileData = {
        ...data,
        photoDataUrl: photoPreview || '', // Ensure photoPreview is used if form value isn't directly set
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, STUDENT_PROFILES_COLLECTION, currentStudentUsername), profileData, { merge: true });
      toast({ title: t('profileUpdateSuccessTitle'), description: t('profileUpdateSuccessMessage') });
      // Update localStorage cache for header
      localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify({ name: data.name, photoDataUrl: photoPreview }));
      // Trigger a custom event to notify header to update (optional, direct localStorage read on nav is also an option)
      window.dispatchEvent(new Event('studentProfileUpdated'));

    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: t('errorOccurred'), description: t('saveErrorDetails'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStudentLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STUDENT_LOGGED_IN_KEY);
      localStorage.removeItem(STUDENT_USERNAME_KEY);
      localStorage.removeItem(STUDENT_PROFILE_LOCALSTORAGE_KEY); // Clear profile cache
      window.dispatchEvent(new Event('studentLoggedOut')); // Notify header
    }
    router.push('/student-login');
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 relative w-32 h-32 mx-auto">
            <Image
              src={photoPreview || "https://placehold.co/128x128.png"}
              alt={t('profilePhotoAlt')}
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-primary"
              data-ai-hint="profile avatar"
            />
            <Label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-accent text-accent-foreground p-2 rounded-full cursor-pointer hover:bg-accent/80">
              <Camera className="h-5 w-5" />
              <Input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </Label>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('studentProfileTitle')}</CardTitle>
          <CardDescription>{t('studentProfileDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel><User className="inline mr-2 h-4 w-4"/>{t('studentName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel><Mail className="inline mr-2 h-4 w-4"/>{t('emailAddress')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel><Phone className="inline mr-2 h-4 w-4"/>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel><Home className="inline mr-2 h-4 w-4"/>{t('address')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('saving')}</> : t('saveProfileButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardContent className="border-t pt-6 text-center">
            <Button variant="outline" onClick={handleStudentLogout} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> {t('studentLogoutButton')}
            </Button>
          </CardContent>
      </Card>

      {/* My Course Section - Merged Content */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline text-primary flex items-center">
            <GraduationCap className="mr-3 h-8 w-8 text-accent" />
            {t('myCourseSectionTitle')}
          </CardTitle>
          <CardDescription>{t('myCourseSectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="overflow-hidden rounded-lg shadow-md mb-4">
            <Image
              src="https://placehold.co/800x300.png"
              alt={t('myCourseSectionTitle')}
              width={800}
              height={300}
              className="w-full h-auto object-cover"
              data-ai-hint="student dashboard course"
            />
          </div>
          <p className="text-center text-muted-foreground">
            {t('myCourseContentPlaceholder')}
          </p>
          {/* Future: List enrolled courses, progress, links to course material etc. */}
        </CardContent>
      </Card>
    </div>
  );
}
