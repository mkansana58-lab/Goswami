
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

  const getYouTubeEmbedUrl = useCallback((url: string | undefined | null): string | null => {
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
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }, []);

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

        try {
            console.log(`LiveClassesPage: Processing doc ID: ${doc.id}, RAW DATA:`, JSON.parse(JSON.stringify(data)));
        } catch (e) {
            console.error(`LiveClassesPage: Could not stringify raw data for doc ID: ${doc.id}`, data, e);
        }

        if (scheduledAtTimestamp && typeof scheduledAtTimestamp.toDate === 'function') {
          const scheduledDateTime = scheduledAtTimestamp.toDate();
          
          console.log(`LiveClassesPage: Doc ID: ${doc.id}, Scheduled Time: ${scheduledDateTime.toISOString()}, Current Time: ${now.toISOString()}, Title: ${data.title}`);

          if (scheduledDateTime.getTime() > now.getTime()) {
            fetchedUpcomingClasses.push({
              id: doc.id,
              title: data.title,
              subject: data.subject,
              scheduledAt: scheduledAtTimestamp,
              displayDate: scheduledDateTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
              displayTime: scheduledDateTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
              link: data.link,
              embedUrl: getYouTubeEmbedUrl(data.link || '') || data.link,
              createdAt: data.createdAt as Timestamp,
            });
          } else {
             console.log(`LiveClassesPage: FILTERING OUT PAST/CURRENT class ${doc.id} (Title: ${data.title}), scheduled at ${scheduledDateTime.toLocaleString()} (raw timestamp seconds: ${scheduledAtTimestamp.seconds})`);
          }
        } else {
          console.warn(`LiveClassesPage: Document ${doc.id} (Title: ${data.title}) in ${LIVE_CLASSES_COLLECTION} has INVALID or MISSING scheduledAt. Skipping. RAW scheduledAt:`, data.scheduledAt);
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
  }, [isClient, t, toast, language, getYouTubeEmbedUrl]);


  const onAdminSubmit: SubmitHandler<LiveClassFormValues> = async (data) => {
    if (!showAdminFeatures) return;
    setIsSubmitting(true);
    console.log("LiveClassesPage: Admin Form SUBMITTING. Form data:", JSON.parse(JSON.stringify(data)));

    const [yearStr, monthStr, dayStr] = data.date.split('-');
    const [hoursStr, minutesStr] = data.time.split(':');

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    let scheduledAtJSDate: Date;
    try {
      if (isNaN(year) || year < 1000 || year > 3000 ||
          isNaN(month) || month < 1 || month > 12 ||
          isNaN(day) || day < 1 || day > 31 ||
          isNaN(hours) || hours < 0 || hours > 23 ||
          isNaN(minutes) || minutes < 0 || minutes > 59) {
        const errorDetail = `Invalid number conversion or out-of-range value. Y:${year}, M:${month}, D:${day}, H:${hours}, Min:${minutes}`;
        console.error("LiveClassesPage: ERROR - " + errorDetail, { dataDate: data.date, dataTime: data.time });
        throw new Error(errorDetail);
      }

      scheduledAtJSDate = new Date(year, month - 1, day, hours, minutes); // Month is 0-indexed

      if (isNaN(scheduledAtJSDate.getTime()) ||
          scheduledAtJSDate.getFullYear() !== year ||
          scheduledAtJSDate.getMonth() !== month - 1 ||
          scheduledAtJSDate.getDate() !== day ||
          scheduledAtJSDate.getHours() !== hours ||
          scheduledAtJSDate.getMinutes() !== minutes
          ) {
        const constructedParts = {gy: scheduledAtJSDate.getFullYear(), gm: scheduledAtJSDate.getMonth(), gd: scheduledAtJSDate.getDate(), gh: scheduledAtJSDate.getHours(), gmin: scheduledAtJSDate.getMinutes() };
        const errorDetail = `Constructed JS Date is invalid or does not match input parts. Input: Y${year}M${month-1}D${day}H${hours}Min${minutes}. Constructed: ${JSON.stringify(constructedParts)}. Date obj: ${scheduledAtJSDate.toISOString()}`;
        console.error("LiveClassesPage: ERROR - " + errorDetail);
        throw new Error("Invalid date or time components resulted in inconsistent Date object. Please check YYYY-MM-DD and HH:MM format.");
      }
      console.log("LiveClassesPage: Successfully created JS Date for scheduledAt:", scheduledAtJSDate.toISOString());
    } catch (e: any) {
      console.error("LiveClassesPage: ERROR - Could not construct valid JS Date from form input.", { date: data.date, time: data.time, errorMsg: e.message, stack: e.stack });
      toast({ title: t('errorOccurred'), description: `${t('validationDateYYYYMMDD')} / ${t('validationTimeHHMM')}. ${e.message}`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    let scheduledAtTimestamp: Timestamp;
    try {
        scheduledAtTimestamp = Timestamp.fromDate(scheduledAtJSDate);
        console.log("LiveClassesPage: Converted to Firestore Timestamp for scheduledAt:", JSON.parse(JSON.stringify(scheduledAtTimestamp)));
    } catch (e:any) {
        console.error("LiveClassesPage: ERROR - Could not convert JS Date to Firestore Timestamp.", { jsDate: scheduledAtJSDate, errorMsg: e.message, stack: e.stack });
        toast({ title: t('errorOccurred'), description: "Failed to create Firestore timestamp from date/time.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const serverNowTimestamp = serverTimestamp();
    console.log("LiveClassesPage: Valid serverNowTimestamp for createdAt (pending server evaluation):", JSON.parse(JSON.stringify(serverNowTimestamp)));

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
         toast({ title: t('errorOccurred'), description: `Failed to create notification: ${notifError.message}`, variant: "destructive" });
      }

      toast({ title: t('liveClassAddedSuccess') });
      liveClassForm.reset();
    } catch (error: any) {
      console.error("LiveClassesPage: ERROR adding live class to Firestore:", { message: error.message, code: error.code, stack: error.stack, details: error.details, fullError: error});
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
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
                      <FormControl><Input type="text" placeholder={t('liveClassDatePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={liveClassForm.control} name="time" render={({ field }) => (
                    <FormItem><FormLabel>{t('liveClassTimeLabel')}</FormLabel><FormControl><Input type="text" placeholder={t('liveClassTimePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
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
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground text-center p-4">
                  {t('liveClassVideoPlaybackNotAvailable') || "Video playback for this type of link is not directly available here. Please use the join link."}
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                    <a href={currentClassForPlayer.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> {t('joinClassButton')}
                    </a>
                </Button>
                <Button onClick={() => {setSelectedVideoUrl(null); setSelectedVideoTitle(null);}} variant="outline" className="flex-1">
                    {t('closePlayerButton') || "Close Player"}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">{t('upcomingLiveClasses')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && liveClasses.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : liveClasses.length > 0 ? (
            <ul className="space-y-4">
              {liveClasses.map((liveClass) => (
                <li key={liveClass.id} className="p-4 bg-muted/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-secondary-foreground">{liveClass.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('subject')}: {liveClass.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {liveClass.displayDate} - {liveClass.displayTime}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                        {liveClass.embedUrl && liveClass.embedUrl.includes("youtube.com/embed/") ? (
                            <Button
                                onClick={() => {setSelectedVideoUrl(liveClass.embedUrl!); setSelectedVideoTitle(liveClass.title);}}
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <PlaySquare className="mr-2 h-4 w-4" /> {t('watchHere') || "Watch Here"}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {setSelectedVideoUrl(liveClass.link); setSelectedVideoTitle(liveClass.title);}}
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <PlaySquare className="mr-2 h-4 w-4" /> {t('viewDetails') || "View Details"}
                            </Button>
                        )}
                        <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                            <a href={liveClass.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> {t('joinClassButton')}
                            </a>
                        </Button>
                      {showAdminFeatures && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2">
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
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-10">{t('noLiveClassesScheduled')}</p>
          )}
        </CardContent>
        <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground mx-auto">
                {t('liveClassDataNote') || "Live class data is fetched from Firestore. Past classes are automatically hidden. Admin can add new classes using the form above if logged in."}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    