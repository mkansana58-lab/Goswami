
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { getLiveClasses, type LiveClass } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioTower, Calendar, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function LiveClassesPage() {
    const { t } = useLanguage();
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    useEffect(() => {
        async function fetchClasses() {
            if (!isFirebaseConfigured) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const fetchedClasses = await getLiveClasses();
                setClasses(fetchedClasses);
            } catch (error) {
                console.error("Failed to fetch live classes:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchClasses();
    }, [isFirebaseConfigured]);

    const formatScheduledAt = (timestamp: any) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return { date: 'N/A', time: 'N/A' };
        }
        const date = timestamp.toDate();
        return {
            date: format(date, 'PPP'), // e.g., Jun 21, 2024
            time: format(date, 'p')    // e.g., 12:00 PM
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <RadioTower className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('liveClasses')}</h1>
                <p className="text-muted-foreground">Join our live interactive sessions.</p>
            </div>
            
            {!isFirebaseConfigured ? (
                 <Card className="border-destructive bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="text-destructive">Firebase Not Configured</CardTitle>
                    </CardHeader>
                    <CardContent className="text-destructive/90">
                         <p className="font-bold">This is a required setup step.</p>
                        <p className="mt-2">To make features like Live Classes and Notifications work, you need to connect this app to your own Firebase project.</p>
                        <p className="mt-4 font-bold">How to Fix:</p>
                        <p className="mt-1">In the Firebase Studio interface, look for a button or option to <strong>"Connect Firebase"</strong> or <strong>"Set up Firebase"</strong>. Click it and follow the instructions to link your project.</p>
                        <p className="mt-2">Once connected, this page will show live classes.</p>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading classes...</p>
                </div>
            ) : classes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => {
                        const { date, time } = formatScheduledAt(cls.scheduledAt);
                        return (
                        <Card key={cls.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{cls.title || 'Untitled Class'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-grow">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{time}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" disabled={!cls.link}>
                                    <a href={cls.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        {t('joinClass')}
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-card p-10 rounded-lg">
                    <RadioTower className="h-16 w-16 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-semibold">{t('noLiveClassesTitle')}</h2>
                    <p className="mt-2 text-muted-foreground">{t('noLiveClassesDesc')}</p>
              </div>
            )}
        </div>
    );
}
