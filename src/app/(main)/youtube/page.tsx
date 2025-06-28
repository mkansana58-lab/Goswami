
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getVideoLectures, type VideoLecture } from '@/lib/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Youtube as YoutubeIcon, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';

export default function YouTubePage() {
    const { t } = useLanguage();
    const [lectures, setLectures] = useState<VideoLecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getVideoLectures()
            .then(setLectures)
            .catch(err => console.error("Failed to fetch video lectures:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const getYouTubeThumbnail = (url: string) => {
        try {
            const videoId = new URL(url).searchParams.get('v');
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        } catch (e) {
            // Invalid URL
        }
        return `https://placehold.co/400x225.png`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <YoutubeIcon className="h-8 w-8 text-red-500" />
                <h1 className="text-3xl font-bold text-primary">{t('youtube')}</h1>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : lectures.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No videos available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {lectures.map(lecture => (
                       <a key={lecture.id} href={lecture.videoUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col space-y-2">
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                <Image 
                                    src={getYouTubeThumbnail(lecture.videoUrl)} 
                                    alt={lecture.title}
                                    width={500}
                                    height={280}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="video thumbnail"
                                />
                            </div>
                            <div className="flex gap-x-3">
                                <Avatar className="h-10 w-10 shrink-0">
                                    <div className="w-full h-full flex items-center justify-center bg-primary rounded-full">
                                        <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                </Avatar>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                                        {lecture.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('appName')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(lecture.createdAt.toDate(), 'PPP')}
                                    </p>
                                </div>
                            </div>
                       </a>
                    ))}
                </div>
            )}
        </div>
    );
}
