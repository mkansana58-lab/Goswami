
"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper } from 'lucide-react';

export default function DailyPostsPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Newspaper className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('dailyPosts')}</h1>
                <p className="text-muted-foreground">Latest news and notifications from the academy.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t('comingSoon') || 'Content coming soon...'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
