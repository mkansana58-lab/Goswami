
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
import { Tv2, Calendar, Clock, LinkIcon, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Placeholder for actual admin authentication
const isAdmin = true; 
const LIVE_CLASSES_STORAGE_KEY = 'liveClassesSchedule';

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  link: string;
}

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  title: z.string().min(5, { message: t('liveClassTitleLabel') + " must be at least 5 characters." }),
  subject: z.string().min(3, { message: t('liveClassSubjectLabel') + " must be at least 3 characters." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format."}),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Time must be in HH:MM format."}),
  link: z.string().url({ message: "Please enter a valid URL for the meeting link." }),
});

type LiveClassFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function LiveClassesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<LiveClassFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      date: "",
      time: "",
      link: "",
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClassesString = localStorage.getItem(LIVE_CLASSES_STORAGE_KEY);
      if (storedClassesString) {
        try {
          const parsedClasses = JSON.parse(storedClassesString);
          if (Array.isArray(parsedClasses)) {
            setLiveClasses(parsedClasses);
          }
        } catch (error) {
          console.error("Error parsing live classes from localStorage:", error);
        }
      }
    }
  }, []);

  const saveLiveClassesToLocalStorage = (classes: LiveClass[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_CLASSES_STORAGE_KEY, JSON.stringify(classes));
    }
  };

  const onSubmit: SubmitHandler<LiveClassFormValues> = (data) => {
    if (!isAdmin) return;
    const newClass: LiveClass = {
      id: `lc-${Date.now()}`,
      ...data,
    };
    const updatedClasses = [...liveClasses, newClass];
    setLiveClasses(updatedClasses);
    saveLiveClassesToLocalStorage(updatedClasses);
    toast({
      title: t('liveClassAddedSuccess'),
    });
    form.reset();
  };

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
        <CardContent>
          {isAdmin && (
            <Card className="mb-8 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl text-secondary-foreground flex items-center">
                  <PlusCircle className="mr-2 h-6 w-6 text-accent" /> {t('addLiveClassTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('liveClassTitleLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('liveClassTitlePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('liveClassSubjectLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('liveClassSubjectPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('liveClassDateLabel')} (YYYY-MM-DD)</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder={t('liveClassDatePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                     <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('liveClassTimeLabel')} (HH:MM - 24hr format)</FormLabel>
                          <FormControl>
                            <Input type="time" placeholder={t('liveClassTimePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('liveClassLinkLabel')}</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder={t('liveClassLinkPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? t('loading') : t('addLiveClassButton')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <h2 className="text-2xl font-bold font-headline text-primary mb-4">{t('upcomingLiveClasses')}</h2>
          {liveClasses.length > 0 ? (
            <div className="space-y-4">
              {liveClasses.sort((a,b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()).map((liveClass) => (
                <Card key={liveClass.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle>
                    <CardDescription>{t('subject')}: {liveClass.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> {new Date(liveClass.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" /> {liveClass.time}
                    </div>
                    <Button variant="outline" asChild className="mt-2 w-full md:w-auto">
                      <a href={liveClass.link} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" /> Join Class
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('noLiveClassesScheduled')}</p>
          )}
        </CardContent>
      </Card>
        <p className="text-center text-sm text-muted-foreground">
        Note: Live class data is stored in your browser's local storage for demonstration.
      </p>
    </div>
  );
}

