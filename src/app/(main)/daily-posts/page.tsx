
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { getNotifications, type Notification } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function DailyPostsPage() {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            setIsLoading(true);
            try {
                const fetchedNotifications = await getNotifications();
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return 'N/A';
        }
        return format(timestamp.toDate(), 'PPP'); // e.g., Jun 22, 2024
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <h1 className="text-3xl font-bold text-primary">{t('dailyPosts')}</h1>
                 <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Newspaper className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('dailyPosts')}</h1>
                <p className="text-muted-foreground">Latest news and notifications from the academy.</p>
            </div>
            
            {notifications.length > 0 ? (
                <div className="space-y-6">
                    {notifications.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1 text-xs">
                                    <Calendar className="h-3 w-3" />
                                    <span>Posted on {formatDate(item.createdAt)}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <p className="whitespace-pre-wrap">{item.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center p-10">
                    <CardHeader>
                      <CardTitle>No Notifications Yet</CardTitle>
                      <CardDescription className="mt-2">Check back later for new updates and posts.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
