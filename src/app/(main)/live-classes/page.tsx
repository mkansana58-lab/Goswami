
"use client";
// This page's public content is now part of the Learning Hub.
// This page can be kept for admin-specific functionalities if needed,
// or could be fully deprecated if admin management is moved elsewhere.

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tv2, PlusCircle, Trash2, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
import Link from 'next/link';
import { generateNotificationMessage } from '@/ai/flows/generate-notification-flow'; // Import AI notification generator

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const LIVE_CLASSES_COLLECTION = 'liveClasses';
const NOTIFICATIONS_COLLECTION = 'notifications';


interface LiveClassData {
  id: string;
  title: string;
  subject: string;
  link: string;
  scheduledAt: Timestamp; 
  createdAt: Timestamp; 
  [key: string]: any; 
}

export default function AdminLiveClassesPage() {
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

  const formatScheduledTimeForNotification = (dateStr: string, timeStr: string, lang: 'en' | 'hi'): string => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(year, month - 1, day, hours, minutes);
      return date.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return `${dateStr} ${timeStr}`; // Fallback
    }
  };

  const onAdminSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!classTitle || !classSubject || !classDate || !classTime || !classLink) {
      toast({ title: t('errorOccurred'), description: t('liveClassValidationAllFields'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const [year, month, day] = classDate.split('-').map(Number);
      const [hours, minutes] = classTime.split(':').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(t('liveClassValidationInvalidDateTime'));
      }
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error(t('liveClassValidationInvalidDateTime'));
      }
      
      const scheduledAtTimestamp = Timestamp.fromDate(scheduledDateTime);
      const newClassData = {
        title: classTitle,
        subject: classSubject,
        link: classLink,
        scheduledAt: scheduledAtTimestamp,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, LIVE_CLASSES_COLLECTION), newClassData);
      
      // Generate AI notification message
      try {
        const formattedTimeForAI = formatScheduledTimeForNotification(classDate, classTime, language);
        const aiNotification = await generateNotificationMessage({
          activityType: 'new_live_class',
          language: language,
          itemName: classTitle,
          itemDetails: `Subject: ${classSubject}, Time: ${formattedTimeForAI}`
        });

        await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
          message: aiNotification.notificationMessage,
          type: 'new_live_class',
          link: '/learning-hub?tab=live-classes',
          timestamp: serverTimestamp(),
          autoGenerated: true
        });
      } catch (notifError: any) {
        console.error("Error adding AI-generated notification for live class:", notifError);
        // Fallback to simple notification if AI fails
        await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
          message: `${t('liveClassAddedSuccess')}: ${classTitle}`,
          type: 'new_live_class',
          link: '/learning-hub?tab=live-classes',
          timestamp: serverTimestamp(),
          autoGenerated: true
        });
      }

      toast({ title: t('liveClassAddedSuccess') });
      resetForm();
    } catch (error: any) {
      console.error("Error adding live class: ", error);
      toast({ title: t('errorOccurred'), description: `${t('saveErrorDetails')} ${error.message ? `(${error.message})` : ''}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLiveClass = async (classId: string) => {
    if (!showAdminFeatures) return;
    try {
      await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION, classId));
      toast({ title: t('itemDeletedSuccess') });
    } catch (error: any) {
      toast({ title: t('errorOccurred'), description: `${t('deleteErrorDetails')} ${error.message ? `(${error.message})` : ''}`, variant: "destructive"});
    }
  };

  useEffect(() => {
    if (!isClient) return;
    setIsLoading(true);
    setFetchError(null);
    const q = query(collection(db, LIVE_CLASSES_COLLECTION), orderBy("scheduledAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // const now = new Date(); // Commented out: Admins see all classes
      const fetchedClasses: LiveClassData[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.scheduledAt && typeof data.scheduledAt.toDate === 'function') {
          fetchedClasses.push({ id: docSnap.id, ...data } as LiveClassData);
        }
      });
      setLiveClassesToDisplay(fetchedClasses);
      setIsLoading(false);
    }, (error) => {
      setFetchError(`${t('fetchErrorDetails')} ${error.message ? `(${error.message})` : ''}`);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isClient, t]); // Removed toast from dependencies as it can cause re-runs

  const formatScheduledTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return t('invalidDateLabel');
    try {
      return timestamp.toDate().toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'long', timeStyle: 'short' });
    } catch (e) { return t('invalidDateLabel'); }
  };

  if (!isClient && isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">{t('loading')}</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4"><Tv2 className="h-16 w-16 text-primary" /></div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('manageLiveClasses')}</CardTitle>
          <CardDescription className="text-lg">{t('liveClassesDesc')}</CardDescription>
           <Button variant="outline" asChild className="mt-2">
            <Link href="/learning-hub?tab=live-classes">
              {t('viewPublicPage') || "View Public Live Classes"} <ExternalLink className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
        </CardHeader>

        {showAdminFeatures && (
          <CardContent className="border-t pt-6">
            <h3 className="text-xl font-semibold text-secondary-foreground mb-4 flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addLiveClassTitle')}</h3>
            <form onSubmit={onAdminSubmit} className="space-y-4">
              <div><label htmlFor="classTitle" className="block text-sm font-medium text-foreground">{t('liveClassTitleLabel')}</label><Input id="classTitle" value={classTitle} onChange={(e) => setClassTitle(e.target.value)} placeholder={t('liveClassTitlePlaceholder')} required className="mt-1" /></div>
              <div><label htmlFor="classSubject" className="block text-sm font-medium text-foreground">{t('liveClassSubjectLabel')}</label><Input id="classSubject" value={classSubject} onChange={(e) => setClassSubject(e.target.value)} placeholder={t('liveClassSubjectPlaceholder')} required className="mt-1" /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label htmlFor="classDate" className="block text-sm font-medium text-foreground">{t('liveClassDateLabel')}</label><Input id="classDate" type="text" value={classDate} onChange={(e) => setClassDate(e.target.value)} placeholder="YYYY-MM-DD" required className="mt-1" /></div>
                <div><label htmlFor="classTime" className="block text-sm font-medium text-foreground">{t('liveClassTimeLabel')}</label><Input id="classTime" type="text" value={classTime} onChange={(e) => setClassTime(e.target.value)} placeholder="HH:MM" required className="mt-1" /></div>
              </div>
              <div><label htmlFor="classLink" className="block text-sm font-medium text-foreground">{t('liveClassLinkLabel')}</label><Input id="classLink" type="url" value={classLink} onChange={(e) => setClassLink(e.target.value)} placeholder={t('liveClassLinkPlaceholder')} required className="mt-1" /></div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isSubmitting ? t('loading') : t('addLiveClassButton')}</Button>
            </form>
          </CardContent>
        )}

        <CardContent className={(isClient && showAdminFeatures) ? "border-t pt-6" : "pt-6"}>
          <h3 className="text-2xl font-semibold text-secondary-foreground mb-6 text-center">{showAdminFeatures ? t('allLiveClassesAdmin') || "All Scheduled Classes (Admin View)" : t('upcomingLiveClasses')}</h3>
          {isLoading && liveClassesToDisplay.length === 0 && !fetchError ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
          ) : fetchError ? (
             <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>
          ) : liveClassesToDisplay.length > 0 ? (
            <div className="space-y-6">
              {liveClassesToDisplay.map((liveClass) => (
                  <Card key={liveClass.id} className={`shadow-md ${new Date(liveClass.scheduledAt.toDate()) < new Date() && showAdminFeatures ? 'opacity-60 bg-muted/30' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle>
                          <CardDescription className="text-sm">{t('subject')}: {liveClass.subject}</CardDescription>
                           {new Date(liveClass.scheduledAt.toDate()) < new Date() && showAdminFeatures && <CardDescription className="text-xs text-destructive">({t('pastEventAdmin') || "Past Event"})</CardDescription>}
                        </div>
                        {showAdminFeatures && (
                           <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteLiveClass(liveClass.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground pt-1">{t('navSchedule')}: {formatScheduledTime(liveClass.scheduledAt)}</p>
                    </CardHeader>
                     <CardContent>
                        <Button asChild variant="outline" size="sm"><a href={liveClass.link} target="_blank" rel="noopener noreferrer">{t('joinClassButton')} / {t('viewLinkAdmin') || "View Link"}</a></Button>
                    </CardContent>
                  </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">{t('noLiveClassesScheduled')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
