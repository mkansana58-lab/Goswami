
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getDownloads, type Download } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, FileDown, Download as DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DownloadsPage() {
    const { t } = useLanguage();
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDownloads()
            .then(setDownloads)
            .catch(err => console.error("Failed to fetch downloads:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <FileDown className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('downloads')}</h1>
                <p className="text-muted-foreground">Download study material and important documents.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('downloads')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : downloads.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('comingSoon') || 'No downloads available.'}</p>
                    ) : (
                        <ul className="space-y-3">
                            {downloads.map(item => (
                                <li key={item.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                    <span className="font-medium">{item.title}</span>
                                    <Button asChild size="sm">
                                        <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                                            <DownloadIcon className="mr-2 h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
