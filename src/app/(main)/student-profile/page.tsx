
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Home as HomeIcon, BookOpen, Edit3, Loader2, LogOut, Percent, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { STUDENT_LOGGED_IN_KEY, STUDENT_USERNAME_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';


interface EnrolledCourse {
  id: string;
  titleKey: keyof ReturnType<typeof useLanguage>['t'];
  progress: number; // 0-100
  descriptionKey: keyof ReturnType<typeof useLanguage>['t'];
}

export interface StudentProfileData {
  name: string;
  email: string;
  mobile: string;
  currentClass: string;
  address: string;
  photoDataUrl?: string;
  dataAiHint?: string;
  enrolledCourses?: EnrolledCourse[];
}

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('studentNameValidation') }),
  email: z.string().email({ message: t('emailValidation') }),
  mobile: z.string().min(10, { message: t('phoneValidation') }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') }),
  currentClass: z.string().min(1, { message: t('classValidation') }),
  address: z.string().min(5, { message: t('addressValidation') }),
  photoDataUrl: z.string().optional(),
});

type StudentProfileFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function StudentProfilePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(formSchemaDefinition(t)),
    defaultValues: { name: "", email: "", mobile: "", currentClass: "", address: "", photoDataUrl: "" },
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      if (!isLoggedIn) {
        router.replace('/student-login');
        return;
      }
      const storedProfile = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
      if (storedProfile) {
        try {
          const parsedProfile: StudentProfileData = JSON.parse(storedProfile);
          setProfileData(parsedProfile);
          form.reset({
            name: parsedProfile.name || "",
            email: parsedProfile.email || "",
            mobile: parsedProfile.mobile || "",
            currentClass: parsedProfile.currentClass || "",
            address: parsedProfile.address || "",
            photoDataUrl: parsedProfile.photoDataUrl || "",
          });
          if (parsedProfile.photoDataUrl) {
            setPreviewImage(parsedProfile.photoDataUrl);
          }
        } catch (e) {
          console.error("Error parsing student profile:", e);
           // Fallback if parsing fails but user is logged in
          const username = localStorage.getItem(STUDENT_USERNAME_KEY) || 'student';
          const defaultProfile: StudentProfileData = {
            name: "New Student", email: `${username}@example.com`, mobile: "", currentClass: "", address: "",
            photoDataUrl: "https://placehold.co/150x150.png?text=S", dataAiHint: "student avatar", enrolledCourses: []
          };
          setProfileData(defaultProfile);
          form.reset(defaultProfile);
          localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify(defaultProfile));
        }
      } else {
        // If no profile, set some defaults for a new logged-in user
        const username = localStorage.getItem(STUDENT_USERNAME_KEY) || 'student';
        const defaultProfile: StudentProfileData = {
          name: "Go Swami Student",
          email: `${username}@example.com`,
          mobile: "9876543210",
          currentClass: "10th",
          address: "123 Defence Colony, New Delhi",
          photoDataUrl: "https://placehold.co/150x150.png?text=Student",
          dataAiHint: "student avatar",
          enrolledCourses: [
             { id: "SAMPLE001", titleKey: "sainikSchoolCourseTitle", progress: 25, descriptionKey: "sainikSchoolCourseTitle" },
          ]
        };
        setProfileData(defaultProfile);
        form.reset(defaultProfile);
        if (defaultProfile.photoDataUrl) setPreviewImage(defaultProfile.photoDataUrl);
        localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify(defaultProfile));
      }
    }
  }, [router, form, t]);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        form.setValue('photoDataUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<StudentProfileFormValues> = (data) => {
    setIsLoading(true);
    // Ensure enrolledCourses and dataAiHint are preserved if they exist
    const currentEnrolledCourses = profileData?.enrolledCourses || [];
    const currentDataAiHint = profileData?.dataAiHint || (previewImage ? "student custom avatar" : "student default avatar");

    const updatedProfile: StudentProfileData = {
      ...data, 
      photoDataUrl: previewImage || data.photoDataUrl || '', 
      enrolledCourses: currentEnrolledCourses,
      dataAiHint: currentDataAiHint,
    };
    
    localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify(updatedProfile));
    setProfileData(updatedProfile); // Update local state
    
    toast({ title: t('profileUpdateSuccessTitle'), description: t('profileUpdateSuccessMessage') });
    window.dispatchEvent(new Event('studentProfileUpdated')); // Notify header
    setIsLoading(false);
  };

  const handleStudentLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STUDENT_LOGGED_IN_KEY);
      localStorage.removeItem(STUDENT_USERNAME_KEY);
      localStorage.removeItem(STUDENT_PROFILE_LOCALSTORAGE_KEY); 
      window.dispatchEvent(new Event('studentLoggedOut'));
    }
    setProfileData(null); // Clear local state
    router.push('/student-login');
  };

  if (!isClient || !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="relative w-32 h-32 mx-auto mb-4 group">
            <Avatar className="w-full h-full border-4 border-primary shadow-lg">
              <AvatarImage src={previewImage || profileData.photoDataUrl} alt={profileData.name || t('profilePhotoAlt')} data-ai-hint={profileData.dataAiHint || "student avatar"}/>
              <AvatarFallback className="text-4xl bg-muted text-primary">{profileData.name?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
            </Avatar>
            <label htmlFor="photoUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Edit3 className="h-8 w-8 text-white" />
              <input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{profileData.name || t('studentProfileTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('studentProfileDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel><User className="inline h-4 w-4 mr-1"/>{t('studentName')}</FormLabel><FormControl><Input {...field} className="text-base md:text-sm h-11" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel><Mail className="inline h-4 w-4 mr-1"/>{t('emailAddress')}</FormLabel><FormControl><Input type="email" {...field} className="text-base md:text-sm h-11"/></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel><Phone className="inline h-4 w-4 mr-1"/>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" {...field} className="text-base md:text-sm h-11"/></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currentClass" render={({ field }) => (<FormItem><FormLabel><BookOpen className="inline h-4 w-4 mr-1"/>{t('currentClass')}</FormLabel><FormControl><Input {...field} className="text-base md:text-sm h-11"/></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel><HomeIcon className="inline h-4 w-4 mr-1"/>{t('address')}</FormLabel><FormControl><Textarea {...field} rows={3} className="text-base md:text-sm min-h-[80px]"/></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <User className="mr-2 h-5 w-5"/>}
                {isLoading ? t('saving') : t('saveProfileButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex-col items-center pt-4">
           <Button variant="destructive" onClick={handleStudentLogout} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" />{t('studentLogoutButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center"><BookOpen className="mr-3 h-7 w-7 text-accent"/>{t('myCourseSectionTitle')}</CardTitle>
          <CardDescription>{t('myCourseSectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {profileData.enrolledCourses && profileData.enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {profileData.enrolledCourses.map(course => (
                <Card key={course.id} className="p-4 shadow-sm hover:shadow-md transition-shadow bg-muted/50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-secondary-foreground">{t(course.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{t(course.descriptionKey)}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="w-full sm:w-2/3 h-3" />
                        <span className="text-xs font-medium text-primary">{course.progress}% {t('complete') || 'Complete'}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0">
                      <Link href="/study-material"> 
                        {t('viewCourseContent') || "View Content"} <ExternalLink className="ml-2 h-3 w-3"/>
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('myCourseContentPlaceholder')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
