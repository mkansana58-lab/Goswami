
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getVideoLectures, type VideoLecture } from '@/lib/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookCopy, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Helper to get a valid embed URL from a YouTube link
const getYouTubeEmbedUrl = (url: string) => {
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        console.error("Invalid YouTube URL:", e);
        return null;
    }
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return null;
};

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
            const urlObj = new URL(url);
            let videoId = urlObj.searchParams.get('v');
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.slice(1);
            }
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
                <BookCopy className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">{t('gdaLearning')}</h1>
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
                    {lectures.map(lecture => {
                        const embedUrl = getYouTubeEmbedUrl(lecture.videoUrl);
                        return (
                            <Dialog key={lecture.id}>
                                <DialogTrigger asChild>
                                   <div className="group flex flex-col space-y-2 cursor-pointer">
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
                                   </div>
                                </DialogTrigger>
                                {embedUrl && (
                                    <DialogContent className="max-w-3xl w-[90vw] aspect-video p-0 border-0">
                                        <iframe
                                            className="w-full h-full rounded-lg"
                                            src={embedUrl}
                                            title={lecture.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </DialogContent>
                                )}
                            </Dialog>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
