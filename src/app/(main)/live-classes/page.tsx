
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
import { collection, addDoc, onSnapshot, Timestamp, orderBy, query, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
const NOTIFICATIONS_COLLECTION = 'notifications';

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

  useEffect(() => {
    if (!isClient) return;

    setIsLoadingClasses(true);
    console.log("LiveClassesPage: Setting up Firestore onSnapshot listener for collection:", LIVE_CLASSES_COLLECTION_NAME);
    
    const q = query(collection(db, LIVE_CLASSES_COLLECTION_NAME), orderBy("scheduledAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`LiveClassesPage: -------- BEGIN ONSNAPSHOT (${new Date().toISOString()}) --------`);
      console.log(`LiveClassesPage: Snapshot triggered. Size: ${querySnapshot.size}. isEmpty: ${querySnapshot.empty}`);
      const currentDocIds = querySnapshot.docs.map(doc => doc.id);
      console.log(`LiveClassesPage: Document IDs in this snapshot: [${currentDocIds.join(', ')}]`);

      const fetchedClasses: LiveClass[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`LiveClassesPage: Processing doc ID: ${doc.id}, RAW DATA:`, JSON.parse(JSON.stringify(data)));

        let scheduledAtTS: Timestamp | null = null;
        if (data.scheduledAt && typeof data.scheduledAt.toDate === 'function') {
            scheduledAtTS = data.scheduledAt as Timestamp;
        } else if (data.scheduledAt && typeof data.scheduledAt === 'object' && data.scheduledAt.seconds !== undefined && data.scheduledAt.nanoseconds !== undefined) {
            console.warn(`LiveClassesPage: doc ${doc.id} scheduledAt was a plain object, attempting to convert. Value:`, data.scheduledAt);
            try {
                scheduledAtTS = new Timestamp(data.scheduledAt.seconds, data.scheduledAt.nanoseconds);
            } catch (e) {
                console.error(`LiveClassesPage: Error converting plain object to Timestamp for scheduledAt on doc ${doc.id}. Error:`, e, "Data:", data.scheduledAt);
                scheduledAtTS = null;
            }
        } else {
             console.warn(`LiveClassesPage: doc ${doc.id} scheduledAt is invalid or missing. Type: ${typeof data.scheduledAt}, Value:`, data.scheduledAt);
        }

        let createdAtTS: Timestamp | null = null;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAtTS = data.createdAt as Timestamp;
        } else if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.seconds !== undefined && data.createdAt.nanoseconds !== undefined) {
            console.warn(`LiveClassesPage: doc ${doc.id} createdAt was a plain object, attempting to convert. Value:`, data.createdAt);
            try {
                createdAtTS = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds);
            } catch (e) {
                console.error(`LiveClassesPage: Error converting plain object to Timestamp for createdAt on doc ${doc.id}. Error:`, e, "Data:", data.createdAt);
                createdAtTS = null;
            }
        } else {
            // This case means createdAt is null or not a recognizable timestamp structure
            console.warn(`LiveClassesPage: doc ${doc.id} createdAt is invalid, null, or missing. Type: ${typeof data.createdAt}, Value:`, data.createdAt);
        }
        
        if (data.title === undefined || data.title === null || data.title.trim() === "") {
          console.warn(`LiveClassesPage: Doc ID ${doc.id} has missing or empty title. Using default. Raw title:`, data.title);
        }
        if (data.subject === undefined || data.subject === null || data.subject.trim() === "") {
          console.warn(`LiveClassesPage: Doc ID ${doc.id} has missing or empty subject. Using default. Raw subject:`, data.subject);
        }

        if (scheduledAtTS) { // Primary check: scheduledAt MUST be valid
            let finalCreatedAtTS: Timestamp;
            if (createdAtTS) {
                finalCreatedAtTS = createdAtTS;
            } else {
                // Log a warning that createdAt was null and we're using scheduledAt as a fallback
                // This is to ensure the class is still displayed if `createdAt` is missing, but flags a data issue.
                console.warn(`LiveClassesPage: Doc ID ${doc.id} 'createdAt' is null or invalid. Using 'scheduledAt' as a fallback for the 'createdAt' property to display the class.`);
                finalCreatedAtTS = scheduledAtTS; // Use scheduledAt as a fallback
            }

            try {
                console.log(`LiveClassesPage: Doc ID ${doc.id} will be ADDED to list. Valid scheduledAt: ${scheduledAtTS.toDate().toISOString()}, resolved createdAt: ${finalCreatedAtTS.toDate().toISOString()}`);
                fetchedClasses.push({
                  id: doc.id,
                  title: data.title || "Untitled Class",
                  subject: data.subject || "No Subject",
                  date: data.date || "N/A", 
                  time: data.time || "N/A", 
                  link: data.link || "#",
                  scheduledAt: scheduledAtTS,
                  createdAt: finalCreatedAtTS, // Use the resolved (possibly fallback) timestamp
                });
            } catch (e: any) {
                 console.error(`LiveClassesPage: Error during toDate().toISOString() for doc ID ${doc.id} when constructing LiveClass object. This class will be SKIPPED. Error: ${e.message}`);
            }
        } else {
            // This means scheduledAt was null or invalid, which is a more critical issue for display/sorting
            console.error(`LiveClassesPage: Doc ID ${doc.id} SKIPPED. title: '${data.title || 'N/A'}'. Reason: Invalid/missing converted scheduledAtTS. Raw scheduledAt: ${JSON.stringify(data.scheduledAt)}`);
        }
      });
      
      console.log(`LiveClassesPage: Processed ${fetchedClasses.length} classes for UI from ${querySnapshot.docs.length} docs in snapshot.`);
      if (fetchedClasses.length > 0) {
        // console.log("LiveClassesPage: Final fetchedClasses to be set (first item):", JSON.parse(JSON.stringify({...fetchedClasses[0], scheduledAt: fetchedClasses[0].scheduledAt.toDate().toISOString(), createdAt: fetchedClasses[0].createdAt.toDate().toISOString() })));
      } else {
        console.log("LiveClassesPage: Final fetchedClasses to be set is empty.");
      }

      setLiveClasses(fetchedClasses);
      setIsLoadingClasses(false);
      console.log(`LiveClassesPage: Live classes state updated by onSnapshot. Total classes in state: ${fetchedClasses.length}`);
      console.log(`LiveClassesPage: -------- END ONSNAPSHOT (${new Date().toISOString()}) --------`);
    }, (error) => {
      console.error("LiveClassesPage: Error in onSnapshot listener:", { message: error.message, code: error.code, stack: error.stack });
      toast({
        title: t('errorOccurred'),
        description: `${t('fetchErrorDetails') || "Failed to load live classes."} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
      setIsLoadingClasses(false);
    });

    return () => {
      console.log("LiveClassesPage: Unsubscribing from Firestore onSnapshot listener.");
      unsubscribe();
    };
  }, [isClient, t, toast, language]);


  const onSubmit: SubmitHandler<LiveClassFormValues> = async (data) => {
    if (!showAdminFeatures) return;
    console.log("LiveClassesPage: Attempting to submit new live class with form data:", data);
    setIsSubmitting(true);
    try {
      const [year, month, day] = data.date.split('-').map(Number);
      const [hours, minutes] = data.time.split(':').map(Number);
      
      let scheduledDate;
      try {
        // Ensure date components are valid before creating Date object
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
            throw new Error("Invalid date or time components provided in form.");
        }
        // Months are 0-indexed in JavaScript Date
        scheduledDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        if (isNaN(scheduledDate.getTime())) {
            throw new Error("Invalid date/time components resulted in an invalid Date object.");
        }
        console.log("LiveClassesPage: Creating scheduledDate JS object (intended as UTC):", scheduledDate.toISOString(), "from inputs:", data.date, data.time);
      } catch (e: any) {
        console.error("LiveClassesPage: Error creating Date object from form inputs.", e, "Inputs:", data.date, data.time);
        toast({ title: t('errorOccurred'), description: `Invalid date or time format: ${e.message || 'Please check YYYY-MM-DD and HH:MM format.'}`, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      const scheduledAtTimestamp = Timestamp.fromDate(scheduledDate);
      console.log("LiveClassesPage: Converted JS Date to Firestore Timestamp for scheduledAt:", scheduledAtTimestamp, "from date:", scheduledDate);
      
      const newClassPayload = {
        title: data.title,
        subject: data.subject,
        date: data.date, 
        time: data.time, 
        link: data.link,
        scheduledAt: scheduledAtTimestamp, 
        createdAt: serverTimestamp() 
      };
      console.log("LiveClassesPage: New class payload for Firestore:", newClassPayload);
      const docRef = await addDoc(collection(db, LIVE_CLASSES_COLLECTION_NAME), newClassPayload);
      console.log("LiveClassesPage: Live class added to Firestore successfully with ID:", docRef.id);
      
      try {
        const notificationPayload = {
          message: `${t('newLiveClassNotification') || 'New Live Class Scheduled'}: ${data.title} - ${data.subject}`,
          type: 'new_live_class',
          link: '/live-classes',
          timestamp: serverTimestamp(),
          autoGenerated: true
        };
        console.log("LiveClassesPage: Attempting to add notification to Firestore:", notificationPayload);
        await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationPayload);
        console.log("LiveClassesPage: Notification for new live class added successfully.");
      } catch (notifError: any) {
        console.error("LiveClassesPage: Error adding notification for live class:", { message: notifError.message, code: notifError.code, stack: notifError.stack });
      }

      toast({ title: t('liveClassAddedSuccess') });
      form.reset();
    } catch (error: any) {
      console.error("LiveClassesPage: Error adding live class to Firestore:", { message: error.message, code: error.code, stack: error.stack, fullError: error });
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails') || "Could not save live class."} ${error.message ? `(${error.message})` : 'Please check console for details.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("LiveClassesPage: Finished submit attempt for live class.");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!showAdminFeatures) return;
    console.log("LiveClassesPage: Attempting to delete live class with ID:", classId);
    try {
      await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION_NAME, classId));
      console.log("LiveClassesPage: Live class deleted from Firestore successfully:", classId);
      toast({ title: t('itemDeletedSuccess') });
    } catch (error: any) {
      console.error("LiveClassesPage: Error deleting live class from Firestore:", { message: error.message, code: error.code, stack: error.stack });
      toast({
        title: t('errorOccurred'),
        description: `${t('deleteErrorDetails') || "Could not delete live class."} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
        console.log("LiveClassesPage: Finished delete attempt for live class:", classId);
    }
  };

  if (!isClient && isLoadingClasses) { 
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
          {isLoadingClasses && liveClasses.length === 0 && isClient ? ( <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
          ) : liveClasses.length > 0 ? (
            <div className="space-y-4">
              {liveClasses.map((liveClass) => (
                <Card key={liveClass.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div><CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle><CardDescription>{t('subject')}: {liveClass.subject}</CardDescription></div>
                    {showAdminFeatures && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteClass(liveClass.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" /> 
                        {liveClass.scheduledAt.toDate().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" /> 
                        {liveClass.scheduledAt.toDate().toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' , hour12: true})}
                         (UTC)
                    </div>
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
    
