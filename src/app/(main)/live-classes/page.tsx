
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tv2, PlusCircle, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore'; // Removed 'where' as filtering is client-side now for past events
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const LIVE_CLASSES_COLLECTION = 'liveClasses';

interface LiveClassData {
  id: string;
  title: string;
  subject: string;
  link: string;
  scheduledAt: Timestamp; 
  createdAt: Timestamp; 
  [key: string]: any; 
}

export default function LiveClassesPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [classTitle, setClassTitle] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [classDate, setClassDate] = useState(''); // YYYY-MM-DD
  const [classTime, setClassTime] = useState(''); // HH:MM
  const [classLink, setClassLink] = useState('');

  const [liveClassesToDisplay, setLiveClassesToDisplay] = useState<LiveClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  const resetForm = () => {
    setClassTitle('');
    setClassSubject('');
    setClassDate('');
    setClassTime('');
    setClassLink('');
  };

  const onAdminSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!classTitle || !classSubject || !classDate || !classTime || !classLink) {
      toast({ title: t('errorOccurred'), description: t('liveClassValidationAllFields') || "Please fill all fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    console.log("LiveClassesPage Admin Submit: Starting submission...");

    try {
      const [yearStr, monthStr, dayStr] = classDate.split('-');
      const [hoursStr, minutesStr] = classTime.split(':');

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10); // 1-12
      const day = parseInt(dayStr, 10);
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      console.log("LiveClassesPage Admin Submit: Parsed Date Parts - Year:", year, "Month:", month, "Day:", day);
      console.log("LiveClassesPage Admin Submit: Parsed Time Parts - Hours:", hours, "Minutes:", minutes);

      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) ||
          month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error("LiveClassesPage Admin Submit: ERROR - Invalid date or time components after parsing. Raw inputs - Date:", classDate, "Time:", classTime);
        throw new Error(t('liveClassValidationInvalidDateTime') || "Invalid date or time format. Use YYYY-MM-DD and HH:MM.");
      }
      
      // JavaScript Date objects are month-indexed (0-11)
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
      console.log("LiveClassesPage Admin Submit: Attempting to construct JS Date with Year:", year, "Month (0-indexed):", month-1, "Day:", day, "Hours:", hours, "Minutes:", minutes);

      if (isNaN(scheduledDateTime.getTime())) {
        console.error("LiveClassesPage Admin Submit: ERROR - Constructed JS Date is invalid. Raw inputs - Date:", classDate, "Time:", classTime);
        throw new Error(t('liveClassValidationInvalidDateTime') || "Invalid date or time. Please check values.");
      }
      console.log("LiveClassesPage Admin Submit: Successfully created JS Date:", scheduledDateTime.toISOString());


      const scheduledAtTimestamp = Timestamp.fromDate(scheduledDateTime);
      const serverNowTimestamp = serverTimestamp(); 

      console.log("LiveClassesPage Admin Submit: Converted to Firestore Timestamp (scheduledAt):", scheduledAtTimestamp);

      const newClassData = {
        title: classTitle,
        subject: classSubject,
        link: classLink,
        scheduledAt: scheduledAtTimestamp,
        createdAt: serverNowTimestamp,
      };
      console.log("LiveClassesPage Admin Submit: PAYLOAD for Firestore:", JSON.parse(JSON.stringify(newClassData)));


      await addDoc(collection(db, LIVE_CLASSES_COLLECTION), newClassData);
      toast({ title: t('liveClassAddedSuccess') });
      resetForm();
    } catch (error: any) {
      console.error("LiveClassesPage Admin Submit: Error adding live class to Firestore: ", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error
      });
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails')} ${error.message ? `(${error.message})` : (t('liveClassValidationInvalidDateTime') || "Check date/time format.")}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("LiveClassesPage Admin Submit: Finished add live class attempt.");
    }
  };

  const handleDeleteLiveClass = async (classId: string) => {
    if (!showAdminFeatures) return;
    console.log(`LiveClassesPage: Attempting to delete live class ${classId}`);
    try {
      await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION, classId));
      toast({ title: t('itemDeletedSuccess') });
      console.log(`LiveClassesPage: Live class ${classId} deleted successfully.`);
    } catch (error: any) {
      console.error(`LiveClassesPage: Error deleting live class ${classId}: `, error);
      toast({
        title: t('errorOccurred'),
        description: `${t('deleteErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isClient) return;
    setIsLoading(true);
    setFetchError(null);
    console.log("LiveClassesPage: Setting up Firestore onSnapshot listener for ALL live classes (client-side filtering for future events).");

    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      orderBy("scheduledAt", "asc") 
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date();
      console.log(`LiveClassesPage: Firestore query (onSnapshot) returned ${querySnapshot.size} documents. Current time for filtering: ${now.toISOString()}`);
      const fetchedClasses: LiveClassData[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id;
        console.log(`LiveClassesPage: Processing doc ID: ${docId}, RAW DATA:`, JSON.parse(JSON.stringify(data)));

        if (!data.title) {
            console.warn(`LiveClassesPage: Doc ID ${docId} SKIPPED. Reason: 'title' is missing. Value:`, data.title);
            return;
        }
        if (!data.scheduledAt || typeof data.scheduledAt.toDate !== 'function') {
          console.warn(`LiveClassesPage: Doc ID ${docId} SKIPPED. Reason: 'scheduledAt' is missing or not a Firestore Timestamp. Value:`, data.scheduledAt);
          return;
        }
        if (!data.createdAt || typeof data.createdAt.toDate !== 'function') { // createdAt can be null briefly before server fills it
          console.warn(`LiveClassesPage: Doc ID ${docId} has 'createdAt' that is not yet a Firestore Timestamp (likely pending server write). Value:`, data.createdAt);
        }


        const scheduledDateTime = data.scheduledAt.toDate();
        console.log(`LiveClassesPage: Doc ID ${docId} - ScheduledAt (JS Date): ${scheduledDateTime.toISOString()}`);
        
        if (scheduledDateTime > now) {
           fetchedClasses.push({
            id: docId,
            title: data.title,
            subject: data.subject || "N/A",
            link: data.link || "#",
            scheduledAt: data.scheduledAt,
            createdAt: data.createdAt, 
          } as LiveClassData);
          console.log(`LiveClassesPage: Doc ID ${docId} INCLUDED (future event).`);
        } else {
           console.log(`LiveClassesPage: Doc ID ${docId} FILTERED OUT (past event). Scheduled: ${scheduledDateTime.toISOString()}`);
        }
      });

      setLiveClassesToDisplay(fetchedClasses);
      setIsLoading(false);
      setFetchError(null);
      console.log("LiveClassesPage: Live classes state updated. Displaying:", fetchedClasses.length, "items.");

    }, (error) => {
      console.error("LiveClassesPage: Error in onSnapshot listener for live classes: ", error);
      toast({
        title: t('errorOccurred'),
        description: `${t('fetchErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
      setIsLoading(false);
      setFetchError(`${t('fetchErrorDetails')} ${error.message ? `(${error.message})` : ''}`);
    });

    return () => {
      console.log("LiveClassesPage: Unsubscribing from live classes Firestore listener.");
      unsubscribe();
    };
  }, [isClient, t, toast]);


  const getYouTubeEmbedUrl = (url: string | undefined): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      }
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname === "/watch") {
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname.startsWith("/live/")) {
         const videoId = urlObj.pathname.split('/live/')[1]?.split('?')[0];
         return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname.startsWith("/embed/")) {
        return url;
      }
    } catch (e) {
      console.warn("LiveClassesPage: Could not parse or transform YouTube URL:", url, e);
      return ""; 
    }
    return ""; 
  };

  const formatScheduledTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      return t('invalidDateLabel') || "Invalid Date"; 
    }
    try {
      return timestamp.toDate().toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
    } catch (e) {
      console.error("Error formatting timestamp:", timestamp, e);
      return t('invalidDateLabel') || "Invalid Date";
    }
  };


  if (!isClient && isLoading) { // Show loading only if not client and still loading
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">{t('loading')}</p></div>;
  }

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
            <h3 className="text-xl font-semibold text-secondary-foreground mb-4 flex items-center">
              <PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addLiveClassTitle')}
            </h3>
            <form onSubmit={onAdminSubmit} className="space-y-4">
              <div>
                <label htmlFor="classTitle" className="block text-sm font-medium text-foreground">{t('liveClassTitleLabel')}</label>
                <Input id="classTitle" value={classTitle} onChange={(e) => setClassTitle(e.target.value)} placeholder={t('liveClassTitlePlaceholder')} required className="mt-1" />
              </div>
              <div>
                <label htmlFor="classSubject" className="block text-sm font-medium text-foreground">{t('liveClassSubjectLabel')}</label>
                <Input id="classSubject" value={classSubject} onChange={(e) => setClassSubject(e.target.value)} placeholder={t('liveClassSubjectPlaceholder')} required className="mt-1" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="classDate" className="block text-sm font-medium text-foreground">{t('liveClassDateLabel')}</label>
                  <Input id="classDate" type="text" value={classDate} onChange={(e) => setClassDate(e.target.value)} placeholder={t('liveClassDatePlaceholder')} required className="mt-1" />
                </div>
                <div>
                  <label htmlFor="classTime" className="block text-sm font-medium text-foreground">{t('liveClassTimeLabel')}</label>
                  <Input id="classTime" type="text" value={classTime} onChange={(e) => setClassTime(e.target.value)} placeholder={t('liveClassTimePlaceholder')} required className="mt-1" />
                </div>
              </div>
              <div>
                <label htmlFor="classLink" className="block text-sm font-medium text-foreground">{t('liveClassLinkLabel')}</label>
                <Input id="classLink" type="url" value={classLink} onChange={(e) => setClassLink(e.target.value)} placeholder={t('liveClassLinkPlaceholder')} required className="mt-1" />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? t('loading') : t('addLiveClassButton')}
              </Button>
            </form>
          </CardContent>
        )}

        <CardContent className={(isClient && showAdminFeatures) ? "border-t pt-6" : "pt-6"}>
          <h3 className="text-2xl font-semibold text-secondary-foreground mb-6 text-center">{t('upcomingLiveClasses')}</h3>
          {isLoading && liveClassesToDisplay.length === 0 && !fetchError ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : fetchError ? (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorOccurred')}</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          ) : liveClassesToDisplay.length > 0 ? (
            <div className="space-y-6">
              {liveClassesToDisplay.map((liveClass) => {
                const embedUrl = getYouTubeEmbedUrl(liveClass.link);
                return (
                  <Card key={liveClass.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle>
                          <CardDescription className="text-sm">{t('subject')}: {liveClass.subject}</CardDescription>
                        </div>
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
                      <p className="text-sm text-muted-foreground pt-1">
                        {t('navSchedule')}: {formatScheduledTime(liveClass.scheduledAt)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {embedUrl ? (
                        <div className="aspect-video rounded-md overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title={liveClass.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                         <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
                           <a href={liveClass.link} target="_blank" rel="noopener noreferrer">
                             {t('joinClassButton')}
                           </a>
                         </Button>
                      )}
                       {!embedUrl && liveClass.link && liveClass.link !== "#" && (
                         <p className="text-xs text-muted-foreground mt-2 text-center">
                           {t('noPreviewAvailable') || "Video preview not available for this link type. Click 'Join Class' to open."}
                         </p>
                       )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">{t('noLiveClassesScheduled')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    