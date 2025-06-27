"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { getLiveClasses, type LiveClass } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioTower, Calendar, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function LiveClassesPage() {
    const { t } = useLanguage();
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchClasses() {
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
    }, []);

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

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <h1 className="text-3xl font-bold text-primary">{t('liveClasses')}</h1>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <RadioTower className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('liveClasses')}</h1>
                <p className="text-muted-foreground">Join our live interactive sessions.</p>
            </div>
            
            {classes.length > 0 ? (
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
                <Card className="text-center p-10">
                    <CardHeader>
                      <CardTitle>{t('noLiveClassesTitle')}</CardTitle>
                      <CardDescription className="mt-2">{t('noLiveClassesDesc')}</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
