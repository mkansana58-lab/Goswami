
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getCurrentAffairs, type CurrentAffair, timestampToDate } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ScrollText } from 'lucide-react';
import { format } from 'date-fns';

export default function CurrentAffairsPage() {
    const { t } = useLanguage();
    const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentAffairs()
            .then(setAffairs)
            .catch(err => console.error("Failed to fetch current affairs:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <ScrollText className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('currentAffairs')}</h1>
                <p className="text-muted-foreground">Stay updated with the latest happenings.</p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : affairs.length === 0 ? (
                 <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No current affairs available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {affairs.map(item => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{format(new Date(item.createdAt), 'PPP')}</p>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{item.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
