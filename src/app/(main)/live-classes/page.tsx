
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tv2, PlusCircle, Trash2, Loader2, ExternalLink, PlaySquare } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
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

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const LIVE_CLASSES_COLLECTION = 'liveClasses';
const NOTIFICATIONS_COLLECTION = 'notifications'; 

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  scheduledAt: Timestamp; 
  displayDate?: string; 
  displayTime?: string; 
  link: string;
  embedUrl?: string;
  createdAt: Timestamp;
}

const liveClassFormSchemaDefinition = (t: (key: string) => string) => z.object({
  title: z.string().min(3, { message: t('liveClassTitleLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  subject: z.string().min(3, { message: t('liveClassSubjectLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: t('validationDateYYYYMMDD') || "Date must be in YYYY-MM-DD format."}),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: t('validationTimeHHMM') || "Time must be in HH:MM format (24-hour)."}),
  link: z.string().url({ message: t('validationUrl') || "Please enter a valid URL." }),
});
type LiveClassFormValues = z.infer<ReturnType<typeof liveClassFormSchemaDefinition>>;

export default function LiveClassesPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string | null>(null);

  const liveClassForm = useForm<LiveClassFormValues>({
    resolver: zodResolver(liveClassFormSchemaDefinition(t)),
    defaultValues: { title: "", subject: "", date: "", time: "", link: "" },
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/live/')) {
          videoId = urlObj.pathname.split('/live/')[1]?.split('?')[0];
        } else if (urlObj.pathname.startsWith('/embed/')) {
          return url; 
        }
      }
    } catch (e) {
      console.warn("LiveClassesPage: Could not parse URL for YouTube ID:", url, e);
      return url; // Return original URL if parsing fails or it's not a typical YouTube link
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url; // Return embed URL or original if no ID found
  };

  useEffect(() => {
    if (!isClient) return;
    console.log("LiveClassesPage: Setting up Firestore onSnapshot listener.");
    setIsLoading(true);

    const q = query(collection(db, LIVE_CLASSES_COLLECTION), orderBy("scheduledAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`LiveClassesPage: Firestore query returned ${querySnapshot.docs.length} documents raw.`);
      const now = new Date();
      const fetchedUpcomingClasses: LiveClass[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const scheduledAtTimestamp = data.scheduledAt as Timestamp;

        if (scheduledAtTimestamp && typeof scheduledAtTimestamp.toDate === 'function') {
          const scheduledDateTime = scheduledAtTimestamp.toDate();
          
          // Only include classes that are scheduled for the future
          if (scheduledDateTime.getTime() > now.getTime()) {
            fetchedUpcomingClasses.push({
              id: doc.id,
              title: data.title,
              subject: data.subject,
              scheduledAt: scheduledAtTimestamp,
              displayDate: scheduledDateTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
              displayTime: scheduledDateTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
              link: data.link,
              embedUrl: getYouTubeEmbedUrl(data.link || '') || data.link, // Ensure data.link is a string
              createdAt: data.createdAt as Timestamp,
            });
          } else {
             console.log(`LiveClassesPage: Filtering out past class ${doc.id}, scheduled at ${scheduledDateTime}`);
          }
        } else {
          console.warn(`LiveClassesPage: Document ${doc.id} in ${LIVE_CLASSES_COLLECTION} has invalid or missing scheduledAt. RAW DATA:`, JSON.parse(JSON.stringify(data)));
        }
      });
      
      setLiveClasses(fetchedUpcomingClasses);
      setIsLoading(false);
      console.log("LiveClassesPage: Upcoming live classes state updated. Total upcoming:", fetchedUpcomingClasses.length);
    }, (error) => {
      console.error("LiveClassesPage: Error in onSnapshot listener for live classes:", error);
      toast({
        title: t('errorOccurred'),
        description: `${t('fetchErrorDetails')} for live classes. ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => {
      console.log("LiveClassesPage: Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, [isClient, t, toast, language]);


  const onAdminSubmit: SubmitHandler<LiveClassFormValues> = async (data) => {
    if (!showAdminFeatures) return;
    setIsSubmitting(true);
    console.log("LiveClassesPage: Admin Form SUBMITTING. Form data:", JSON.parse(JSON.stringify(data)));

    const [yearStr, monthStr, dayStr] = data.date.split('-');
    const [hoursStr, minutesStr] = data.time.split(':');

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // Month is 1-indexed from form
    const day = parseInt(dayStr, 10);
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    let scheduledAtJSDate: Date;
    try {
      if (isNaN(year) || year < 1000 || year > 3000 || // Basic year check
          isNaN(month) || month < 1 || month > 12 ||
          isNaN(day) || day < 1 || day > 31 ||
          isNaN(hours) || hours < 0 || hours > 23 ||
          isNaN(minutes) || minutes < 0 || minutes > 59) {
        throw new Error("Invalid number conversion or out-of-range value for date/time components.");
      }
      // Month is 0-indexed in JavaScript Date constructor
      scheduledAtJSDate = new Date(year, month - 1, day, hours, minutes);
      if (isNaN(scheduledAtJSDate.getTime()) || 
          scheduledAtJSDate.getFullYear() !== year ||
          scheduledAtJSDate.getMonth() !== month - 1 ||
          scheduledAtJSDate.getDate() !== day) {
         console.error("LiveClassesPage: ERROR - Constructed JS Date is invalid or does not match input parts.", { year, month, day, hours, minutes, constructed: scheduledAtJSDate.toISOString() });
        throw new Error("Invalid date or time components resulted in inconsistent Date object.");
      }
      console.log("LiveClassesPage: Successfully created JS Date for scheduledAt:", scheduledAtJSDate.toISOString());
    } catch (e: any) {
      console.error("LiveClassesPage: ERROR - Could not construct valid JS Date from form input.", { date: data.date, time: data.time, error: e.message });
      toast({ title: t('errorOccurred'), description: `${t('validationDateYYYYMMDD')} / ${t('validationTimeHHMM')}. ${e.message}`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    
    let scheduledAtTimestamp: Timestamp;
    try {
        scheduledAtTimestamp = Timestamp.fromDate(scheduledAtJSDate);
        console.log("LiveClassesPage: Converted to Firestore Timestamp for scheduledAt:", scheduledAtTimestamp);
    } catch (e:any) {
        console.error("LiveClassesPage: ERROR - Could not convert JS Date to Firestore Timestamp.", { jsDate: scheduledAtJSDate, error: e.message });
        toast({ title: t('errorOccurred'), description: "Failed to create Firestore timestamp from date/time.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const serverNowTimestamp = serverTimestamp();
    console.log("LiveClassesPage: Valid scheduledAtTimestamp:", scheduledAtTimestamp, "Valid serverNowTimestamp for createdAt (pending server evaluation):", serverNowTimestamp);


    const newClassPayload = {
      title: data.title,
      subject: data.subject,
      link: data.link,
      scheduledAt: scheduledAtTimestamp,
      createdAt: serverNowTimestamp, 
    };
    console.log("LiveClassesPage: PAYLOAD to be sent to Firestore:", JSON.parse(JSON.stringify(newClassPayload)));


    try {
      const docRef = await addDoc(collection(db, LIVE_CLASSES_COLLECTION), newClassPayload);
      console.log("LiveClassesPage: Live class added to Firestore successfully. Document ID:", docRef.id);
      
      try {
        const notificationMessage = `${t('liveClassAddedSuccess')}: ${data.title}`;
        await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
          message: notificationMessage,
          type: 'new_live_class',
          link: '/live-classes',
          timestamp: serverTimestamp(),
          autoGenerated: true
        });
        console.log("LiveClassesPage: Notification for new live class added successfully.");
      } catch (notifError: any) {
         console.error("LiveClassesPage: Error adding notification for new live class:", notifError);
         // Non-critical, so don't block main success toast, but log and maybe show a minor warning
         toast({ title: t('errorOccurred'), description: `Failed to create notification: ${notifError.message}`, variant: "destructive" }); // Changed to destructive as it's an error
      }

      toast({ title: t('liveClassAddedSuccess') });
      liveClassForm.reset();
    } catch (error: any) {
      console.error("LiveClassesPage: ERROR adding live class to Firestore:", error);
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("LiveClassesPage: Finished add live class attempt.");
    }
  };

  const handleDeleteLiveClass = async (classId: string) => {
    if (!showAdminFeatures) return;
    console.log(`LiveClassesPage: Attempting to delete live class ${classId}`);
    try {
      await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION, classId));
      console.log(`LiveClassesPage: Live class ${classId} deleted successfully.`);
      toast({ title: t('itemDeletedSuccess') });
      // No need to manually filter state, onSnapshot will update it.
    } catch (error: any) {
      console.error(`LiveClassesPage: Error deleting live class ${classId}:`, error);
      toast({
        title: t('errorOccurred'),
        description: `${t('deleteErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    // Basic loading state for SSR or initial client load
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">{t('loading')}</p></div>;
  }
  
  const currentClassForPlayer = liveClasses.find(cls => cls.embedUrl === selectedVideoUrl && cls.title === selectedVideoTitle);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Tv2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('liveClassesTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('liveClassesDesc')}</CardDescription>
        </CardHeader>
        
        {showAdminFeatures && (
          <CardContent className="border-t pt-6">
            <h2 className="text-xl font-semibold text-secondary-foreground mb-4 flex items-center">
              <PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addLiveClassTitle')}
            </h2>
            <Form {...liveClassForm}>
              <form onSubmit={liveClassForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                <FormField control={liveClassForm.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>{t('liveClassTitleLabel')}</FormLabel><FormControl><Input placeholder={t('liveClassTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={liveClassForm.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>{t('liveClassSubjectLabel')}</FormLabel><FormControl><Input placeholder={t('liveClassSubjectPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={liveClassForm.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('liveClassDateLabel')}</FormLabel>
                      <FormControl><Input type="text" placeholder={t('liveClassDatePlaceholder')} {...field} /></FormControl> {/* Changed type to "text" */}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={liveClassForm.control} name="time" render={({ field }) => (
                    <FormItem><FormLabel>{t('liveClassTimeLabel')}</FormLabel><FormControl><Input type="time" placeholder={t('liveClassTimePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={liveClassForm.control} name="link" render={({ field }) => (
                  <FormItem><FormLabel>{t('liveClassLinkLabel')}</FormLabel><FormControl><Input placeholder={t('liveClassLinkPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? t('loading') : t('addLiveClassButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Video Player Section */}
      {selectedVideoUrl && currentClassForPlayer && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">{currentClassForPlayer.title}</CardTitle>
            <CardDescription>{t('subject')}: {currentClassForPlayer.subject}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentClassForPlayer.embedUrl && currentClassForPlayer.embedUrl.includes('youtube.com/embed/') ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentClassForPlayer.embedUrl}
                  title={currentClassForPlayer.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
              </div>
            ) : (
              // Fallback for non-embeddable or non-YouTube links
              <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground p-4 text-center">
                  {t('videoLectures')} ({currentClassForPlayer.title}) - {t('liveClassLinkPlaceholder')}
                  <br />
                  <a href={currentClassForPlayer.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center justify-center mt-2">
                    {t('joinClassButton')} <ExternalLink className="ml-2 h-4 w-4"/>
                  </a>
                </p>
              </div>
            )}
             <Button onClick={() => {setSelectedVideoUrl(null); setSelectedVideoTitle(null);}} className="mt-4" variant="outline">Close Player</Button>
          </CardContent>
        </Card>
      )}


      {/* Upcoming Live Classes List */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('upcomingLiveClasses')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && liveClasses.length === 0 ? ( // Show loading only if list is empty and still loading
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">{t('loading')}</p>
            </div>
          ) : liveClasses.length > 0 ? (
            <div className="space-y-4">
              {liveClasses.map((liveClass) => (
                <Card key={liveClass.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-semibold text-secondary-foreground">{liveClass.title}</h3>
                      <p className="text-sm text-muted-foreground">{t('subject')}: {liveClass.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('date')}: {liveClass.displayDate} | {t('scheduleTimeLabel')}: {liveClass.displayTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => {
                          setSelectedVideoUrl(liveClass.embedUrl || liveClass.link);
                          setSelectedVideoTitle(liveClass.title);
                        }}
                        className="bg-primary hover:bg-primary/90" // Use primary color for join button
                      >
                        <PlaySquare className="mr-2 h-4 w-4"/> {t('joinClassButton')}
                      </Button>
                      {showAdminFeatures && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteLiveClass(liveClass.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                {t('deleteButton')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && <p className="text-center text-muted-foreground py-6">{t('noLiveClassesScheduled')}</p> // Show no classes only if not loading
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground mx-auto text-center">
              {t('localStorageNote').replace('local storage', 'Firebase Firestore')}
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}

    