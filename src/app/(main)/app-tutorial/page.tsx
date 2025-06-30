
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Youtube } from 'lucide-react';
import { getAppConfig, type AppConfig } from '@/lib/firebase';

export default function AppTutorialPage() {
    const { t } = useLanguage();
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAppConfig()
            .then(setConfig)
            .catch(err => console.error("Failed to fetch app config:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Youtube className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('appTutorial')}</h1>
                <p className="text-muted-foreground">Learn how to use the app effectively.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>App Tutorial Video</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : config?.appTutorialEmbedCode ? (
                        <div 
                            className="aspect-video w-full rounded-lg overflow-hidden [&>iframe]:w-full [&>iframe]:h-full"
                            dangerouslySetInnerHTML={{ __html: config.appTutorialEmbedCode.replace(/width="[^"]*"/g, 'width="100%"').replace(/height="[^"]*"/g, 'height="100%"') }} 
                        />
                    ) : (
                         <div className="flex justify-center items-center h-64 bg-muted rounded-lg">
                            <p className="text-muted-foreground">{t('comingSoon') || 'Tutorial video will be added soon.'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
