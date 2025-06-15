
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tv2, Calendar, Clock, LinkIcon, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LIVE_CLASSES_COLLECTION_NAME = 'liveClasses';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

interface LiveClass {
  id: string; 
  title: string;
  subject: string;
  date: string; 
  time: string; 
  link: string;
  scheduledAt: Timestamp; 
  createdAt: Timestamp;
}

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  title: z.string().min(5, { message: t('liveClassTitleLabel') + " " + (t('validationMin5Chars') || "must be at least 5 characters.") }),
  subject: z.string().min(3, { message: t('liveClassSubjectLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: t('validationDateYYYYMMDD') || "Date must be in YYYY-MM-DD format."}),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: t('validationTimeHHMM') || "Time must be in HH:MM format (24-hour)."}),
  link: z.string().url({ message: t('validationUrl') || "Please enter a valid URL for the meeting link." }),
});

type LiveClassFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function LiveClassesPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<LiveClassFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: { title: "", subject: "", date: "", time: "", link: "" },
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  const fetchLiveClasses = async () => {
    if (!isClient) return;
    setIsLoadingClasses(true);
    console.log("Fetching live classes...");
    try {
      const q = query(collection(db, LIVE_CLASSES_COLLECTION_NAME), orderBy("scheduledAt", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedClasses: LiveClass[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedClasses.push({
          id: doc.id,
          title: data.title,
          subject: data.subject,
          date: data.date, 
          time: data.time, 
          link: data.link,
          scheduledAt: data.scheduledAt as Timestamp,
          createdAt: data.createdAt as Timestamp,
        });
      });
      setLiveClasses(fetchedClasses);
      console.log("Live classes fetched successfully:", fetchedClasses.length);
    } catch (error: any) {
      console.error("Error fetching live classes from Firestore. Config issue? Rules? Network?", { message: error.message, code: error.code, stack: error.stack, fullError: error });
      toast({
        title: t('errorOccurred'),
        description: `${t('fetchErrorDetails') || "Failed to load live classes."} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingClasses(false);
      console.log("Finished fetching live classes.");
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchLiveClasses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);


  const onSubmit: SubmitHandler<LiveClassFormValues> = async (data) => {
    if (!showAdminFeatures) return;
    console.log("Attempting to submit new live class:", data);
    setIsSubmitting(true);
    try {
      const [year, month, day] = data.date.split('-').map(Number);
      const [hours, minutes] = data.time.split(':').map(Number);
      const scheduledDate = new Date(year, month - 1, day, hours, minutes);
      
      const newClass = {
        title: data.title,
        subject: data.subject,
        date: data.date, 
        time: data.time, 
        link: data.link,
        scheduledAt: Timestamp.fromDate(scheduledDate), 
        createdAt: serverTimestamp() 
      };
      console.log("New class payload for Firestore:", newClass);
      const docRef = await addDoc(collection(db, LIVE_CLASSES_COLLECTION_NAME), newClass);
      console.log("Live class added to Firestore successfully with ID:", docRef.id);
      
      // Add notification
      try {
        await addDoc(collection(db, "notifications"), {
          message: `${t('newLiveClassNotification') || 'New Live Class Scheduled'}: ${data.title} - ${data.subject}`,
          type: 'new_live_class',
          link: '/live-classes',
          timestamp: serverTimestamp(),
          autoGenerated: true
        });
        console.log("Notification for new live class added.");
      } catch (notifError: any) {
        console.error("Error adding notification for live class:", { message: notifError.message, code: notifError.code });
      }

      toast({ title: t('liveClassAddedSuccess') });
      form.reset();
      fetchLiveClasses(); 
    } catch (error: any) {
      console.error("Error adding live class to Firestore. Config issue? Rules? Network?", { message: error.message, code: error.code, stack: error.stack, fullError: error });
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails') || "Could not save live class."} ${error.message ? `(${error.message})` : 'Please check console for details.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("Finished submit attempt for live class.");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!showAdminFeatures) return;
    console.log("Attempting to delete live class with ID:", classId);
    try {
      await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION_NAME, classId));
      console.log("Live class deleted from Firestore successfully:", classId);
      toast({ title: t('itemDeletedSuccess') });
      fetchLiveClasses(); 
    } catch (error: any) {
      console.error("Error deleting live class from Firestore:", { message: error.message, code: error.code, stack: error.stack, fullError: error });
      toast({
        title: t('errorOccurred'),
        description: `${t('deleteErrorDetails') || "Could not delete live class."} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
        console.log("Finished delete attempt for live class:", classId);
    }
  };

  if (!isClient) { 
    return (<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4"><div className="flex justify-center mb-4"><Tv2 className="h-16 w-16 text-primary" /></div><CardTitle className="text-3xl font-bold font-headline text-primary">{t('liveClassesTitle')}</CardTitle><CardDescription className="text-lg">{t('liveClassesDesc')}</CardDescription></CardHeader>
        <CardContent>
          {showAdminFeatures && (
            <Card className="mb-8 bg-muted/30">
              <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addLiveClassTitle')}</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('liveClassTitleLabel')}</FormLabel><FormControl><Input placeholder={t('liveClassTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>{t('liveClassSubjectLabel')}</FormLabel><FormControl><Input placeholder={t('liveClassSubjectPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>{t('liveClassDateLabel')} (YYYY-MM-DD)</FormLabel><FormControl><Input type="date" placeholder={t('liveClassDatePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                     <FormField control={form.control} name="time" render={({ field }) => (<FormItem><FormLabel>{t('liveClassTimeLabel')} (HH:MM - 24hr format)</FormLabel><FormControl><Input type="time" placeholder={t('liveClassTimePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="link" render={({ field }) => (<FormItem><FormLabel>{t('liveClassLinkLabel')}</FormLabel><FormControl><Input type="url" placeholder={t('liveClassLinkPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('loading')}</>) : t('addLiveClassButton')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <h2 className="text-2xl font-bold font-headline text-primary mb-4">{t('upcomingLiveClasses')}</h2>
          {isLoadingClasses && liveClasses.length === 0 ? ( <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
          ) : liveClasses.length > 0 ? (
            <div className="space-y-4">
              {liveClasses.map((liveClass) => (
                <Card key={liveClass.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div><CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle><CardDescription>{t('subject')}: {liveClass.subject}</CardDescription></div>
                    {showAdminFeatures && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteClass(liveClass.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground"><Calendar className="mr-2 h-4 w-4" /> {new Date(liveClass.date + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="flex items-center text-sm text-muted-foreground"><Clock className="mr-2 h-4 w-4" /> {liveClass.time}</div>
                    <Button variant="outline" asChild className="mt-2 w-full md:w-auto"><a href={liveClass.link} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4" /> Join Class</a></Button>
                  </CardContent>
                </Card>
              ))}</div>
          ) : ( <p className="text-center text-muted-foreground py-6">{t('noLiveClassesScheduled')}</p> )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">{t('localStorageNote').replace('local storage', 'Firebase Firestore')}</p>
    </div>
  );
}
// Add to translations
// newLiveClassNotification: "New Live Class Scheduled" (EN/HI)
