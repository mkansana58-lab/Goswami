
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarDays, ListChecks, Megaphone, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
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
const SCHEDULE_COLLECTION = 'classSchedules';
const HOMEWORK_COLLECTION = 'homeworkAssignments';
const UPDATES_COLLECTION = 'academyUpdates';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  subject: string;
  teacher: string;
  createdAt: Timestamp;
}

interface HomeworkItem {
  id: string;
  subject: string;
  task: string;
  dueDate: string;
  createdAt: Timestamp;
}

interface UpdateItem {
  id: string;
  title: string;
  message: string;
  date: string; // Event/effective date for the update
  createdAt: Timestamp;
}

const scheduleFormSchemaDefinition = (t: (key: string) => string) => z.object({
  title: z.string().min(3, { message: t('scheduleItemTitleLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  time: z.string().min(3, { message: t('scheduleTimeLabel') + " " + (t('validationRequired') || "is required.") }),
  subject: z.string().min(3, { message: t('scheduleSubjectLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  teacher: z.string().min(2, { message: t('scheduleTeacherLabel') + " " + (t('validationMin2Chars') || "must be at least 2 characters.") }),
});
type ScheduleFormValues = z.infer<ReturnType<typeof scheduleFormSchemaDefinition>>;

const homeworkFormSchemaDefinition = (t: (key: string) => string) => z.object({
  subject: z.string().min(3, { message: t('homeworkSubjectLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  task: z.string().min(5, { message: t('homeworkTaskLabel') + " " + (t('validationMin5Chars') || "must be at least 5 characters.") }),
  dueDate: z.string().min(3, { message: t('homeworkDueDateLabel') + " " + (t('validationRequired') || "is required.") }),
});
type HomeworkFormValues = z.infer<ReturnType<typeof homeworkFormSchemaDefinition>>;

const updateFormSchemaDefinition = (t: (key: string) => string) => z.object({
  title: z.string().min(3, { message: t('updateTitleLabel') + " " + (t('validationMin3Chars') || "must be at least 3 characters.") }),
  message: z.string().min(10, { message: t('updateMessageLabel') + " " + (t('validationMin10Chars') || "must be at least 10 characters.") }),
  date: z.string().min(3, { message: t('updateDateLabel') + " " + (t('validationRequired') || "is required.") }),
});
type UpdateFormValues = z.infer<ReturnType<typeof updateFormSchemaDefinition>>;


export default function SchedulePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [homeworkItems, setHomeworkItems] = useState<HomeworkItem[]>([]);
  const [updateItems, setUpdateItems] = useState<UpdateItem[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  const fetchData = async () => {
    if(!isClient) return;
    setIsLoadingData(true);
    try {
      const scheduleQuery = query(collection(db, SCHEDULE_COLLECTION), orderBy("createdAt", "desc"));
      const scheduleSnapshot = await getDocs(scheduleQuery);
      setScheduleItems(scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleItem)));

      const homeworkQuery = query(collection(db, HOMEWORK_COLLECTION), orderBy("createdAt", "desc"));
      const homeworkSnapshot = await getDocs(homeworkQuery);
      setHomeworkItems(homeworkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomeworkItem)));

      const updatesQuery = query(collection(db, UPDATES_COLLECTION), orderBy("createdAt", "desc"));
      const updatesSnapshot = await getDocs(updatesQuery);
      setUpdateItems(updatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpdateItem)));

    } catch (error: any) {
      console.error("Error fetching schedule data from Firestore:", error.message, error.code, error.stack);
      toast({
        title: t('errorOccurred'),
        description: `${t('fetchErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const scheduleForm = useForm<ScheduleFormValues>({ resolver: zodResolver(scheduleFormSchemaDefinition(t)), defaultValues: { title: "", time: "", subject: "", teacher: "" }});
  const homeworkForm = useForm<HomeworkFormValues>({ resolver: zodResolver(homeworkFormSchemaDefinition(t)), defaultValues: { subject: "", task: "", dueDate: "" }});
  const updateForm = useForm<UpdateFormValues>({ resolver: zodResolver(updateFormSchemaDefinition(t)), defaultValues: { title: "", message: "", date: "" }});

  const handleAddItem = async <FormValues,>(
    data: FormValues,
    collectionName: string,
    successMessageKey: string,
    formReset: () => void,
    formInstance: any // To access formState.isSubmitting
  ) => {
    if (!showAdminFeatures) return;
    formInstance.control.fieldsRef.current = {}; // Manually trigger isSubmitting for the specific form

    try {
      const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
      console.log(`${collectionName} item added with ID: `, docRef.id);
      
      // Add notification
      try {
        await addDoc(collection(db, "notifications"), {
          message: `${t(successMessageKey)}: ${(data as any).title || (data as any).subject || 'New Item'}`,
          type: collectionName,
          link: '/schedule',
          timestamp: serverTimestamp(),
          autoGenerated: true
        });
      } catch (notifError) {
        console.error("Error adding notification for schedule item:", notifError);
      }

      toast({ title: t(successMessageKey) });
      formReset();
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error(`Error adding item to ${collectionName}: `, error.message, error.code, error.stack);
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    } finally {
       // Manually reset isSubmitting for the specific form. This is a workaround.
       // A better solution might involve managing submitting state per form.
       if (formInstance.formState.isSubmitting) {
         setTimeout(() => formInstance.reset(undefined, { keepValues: false, keepDirty: false, keepErrors: false, keepIsSubmitted: false, keepTouched: false, keepIsValid: false, keepSubmitCount: false }), 0);
       }
    }
  };
  
  const handleDeleteItem = async (itemId: string, collectionName: string) => {
    if (!showAdminFeatures) return;
    try {
      await deleteDoc(doc(db, collectionName, itemId));
      toast({ title: t('itemDeletedSuccess') });
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error(`Error deleting item from ${collectionName}: `, error.message, error.code, error.stack);
      toast({
        title: t('errorOccurred'),
        description: `${t('deleteErrorDetails')} ${error.message ? `(${error.message})` : ''}`,
        variant: "destructive",
      });
    }
  };

  const onScheduleSubmit: SubmitHandler<ScheduleFormValues> = (data) => handleAddItem(data, SCHEDULE_COLLECTION, 'scheduleAddedSuccess', scheduleForm.reset, scheduleForm);
  const onHomeworkSubmit: SubmitHandler<HomeworkFormValues> = (data) => handleAddItem(data, HOMEWORK_COLLECTION, 'homeworkAddedSuccess', homeworkForm.reset, homeworkForm);
  const onUpdateSubmit: SubmitHandler<UpdateFormValues> = (data) => handleAddItem(data, UPDATES_COLLECTION, 'updateAddedSuccess', updateForm.reset, updateForm);
  
  if (!isClient || isLoadingData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">{t('loading')}</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navSchedule')}</h1>

      {showAdminFeatures && (
        <div className="space-y-6 mb-10">
          {/* Add Schedule Item Form */}
          <Card className="bg-muted/30">
            <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addScheduleTitle')}</CardTitle></CardHeader>
            <CardContent>
              <Form {...scheduleForm}>
                <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-4">
                  <FormField control={scheduleForm.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>{t('scheduleItemTitleLabel')}</FormLabel><FormControl><Input placeholder={t('scheduleItemTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField control={scheduleForm.control} name="time" render={({ field }) => ( <FormItem><FormLabel>{t('scheduleTimeLabel')}</FormLabel><FormControl><Input placeholder={t('scheduleTimePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={scheduleForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>{t('scheduleSubjectLabel')}</FormLabel><FormControl><Input placeholder={t('scheduleSubjectPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={scheduleForm.control} name="teacher" render={({ field }) => (<FormItem><FormLabel>{t('scheduleTeacherLabel')}</FormLabel><FormControl><Input placeholder={t('scheduleTeacherPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={scheduleForm.formState.isSubmitting}>
                    {scheduleForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {scheduleForm.formState.isSubmitting ? t('loading') : t('addScheduleButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Add Homework Item Form */}
          <Card className="bg-muted/30">
             <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addHomeworkTitle')}</CardTitle></CardHeader>
            <CardContent>
              <Form {...homeworkForm}>
                <form onSubmit={homeworkForm.handleSubmit(onHomeworkSubmit)} className="space-y-4">
                   <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={homeworkForm.control} name="subject" render={({ field }) => ( <FormItem><FormLabel>{t('homeworkSubjectLabel')}</FormLabel><FormControl><Input placeholder={t('homeworkSubjectPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={homeworkForm.control} name="dueDate" render={({ field }) => ( <FormItem><FormLabel>{t('homeworkDueDateLabel')}</FormLabel><FormControl><Input placeholder={t('homeworkDueDatePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <FormField control={homeworkForm.control} name="task" render={({ field }) => ( <FormItem><FormLabel>{t('homeworkTaskLabel')}</FormLabel><FormControl><Textarea placeholder={t('homeworkTaskPlaceholder')} {...field} rows={3} /></FormControl><FormMessage /></FormItem> )}/>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={homeworkForm.formState.isSubmitting}>
                     {homeworkForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {homeworkForm.formState.isSubmitting ? t('loading') : t('addHomeworkButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Add Update Item Form */}
          <Card className="bg-muted/30">
            <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addUpdateTitle')}</CardTitle></CardHeader>
            <CardContent>
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={updateForm.control} name="title" render={({ field }) => ( <FormItem><FormLabel>{t('updateTitleLabel')}</FormLabel><FormControl><Input placeholder={t('updateTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={updateForm.control} name="date" render={({ field }) => ( <FormItem><FormLabel>{t('updateDateLabel')}</FormLabel><FormControl><Input placeholder={t('updateDatePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <FormField control={updateForm.control} name="message" render={({ field }) => ( <FormItem><FormLabel>{t('updateMessageLabel')}</FormLabel><FormControl><Textarea placeholder={t('updateMessagePlaceholder')} {...field} rows={3}/></FormControl><FormMessage /></FormItem> )}/>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={updateForm.formState.isSubmitting}>
                    {updateForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {updateForm.formState.isSubmitting ? t('loading') : t('addUpdateButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-3"><CalendarDays className="h-8 w-8 text-accent" /><div><CardTitle className="text-2xl font-headline text-primary">{t('classScheduleTitle')}</CardTitle><CardDescription>{t('dynamicScheduleDesc')}</CardDescription></div></CardHeader>
        <CardContent>
          {scheduleItems.length > 0 ? (<ul className="space-y-3">{scheduleItems.map((item) => (<li key={item.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-start"><div><p className="font-semibold text-secondary-foreground">{item.title} ({item.time})</p><p className="text-sm text-muted-foreground">{t('subject')}: {item.subject}</p><p className="text-sm text-muted-foreground">{t('scheduleTeacherLabel')}: {item.teacher}</p></div>{showAdminFeatures && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteItem(item.id, SCHEDULE_COLLECTION)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</li>))}</ul>) : <p className="text-center text-muted-foreground py-4">{t('noScheduleItems')}</p>}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-3"><ListChecks className="h-8 w-8 text-accent" /><div><CardTitle className="text-2xl font-headline text-primary">{t('homeworkAssignments')}</CardTitle><CardDescription>{t('dynamicHomeworkDesc')}</CardDescription></div></CardHeader>
          <CardContent>
            {homeworkItems.length > 0 ? (<ul className="space-y-3">{homeworkItems.map((item) => (<li key={item.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-start"><div><p className="font-semibold text-secondary-foreground">{item.subject}: {item.task}</p><p className="text-sm text-muted-foreground">{t('homeworkDueDateLabel')}: {item.dueDate}</p></div>{showAdminFeatures && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteItem(item.id, HOMEWORK_COLLECTION)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</li>))}</ul>) : <p className="text-center text-muted-foreground py-4">{t('noHomeworkItems')}</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-3"><Megaphone className="h-8 w-8 text-accent" /><div><CardTitle className="text-2xl font-headline text-primary">{t('importantUpdates')}</CardTitle><CardDescription>{t('dynamicUpdatesDesc')}</CardDescription></div></CardHeader>
          <CardContent>
            {updateItems.length > 0 ? (<ul className="space-y-3">{updateItems.map((item) => (<li key={item.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-start"><div><p className="font-semibold text-secondary-foreground">{item.title} ({item.date})</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.message}</p></div>{showAdminFeatures && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmDeleteMessage')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteItem(item.id, UPDATES_COLLECTION)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('deleteButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</li>))}</ul>) : <p className="text-center text-muted-foreground py-4">{t('noUpdateItems')}</p>}
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('localStorageNote').replace('local storage', 'Firebase Firestore')}
      </p>
    </div>
  );
}
