
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getVideoLectures, type VideoLecture } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Helper to get a valid embed URL from various YouTube link formats
const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
            if (!videoId) {
                const pathParts = urlObj.pathname.split('/');
                if (pathParts[1] === 'shorts') videoId = pathParts[2];
                else if (pathParts[1] === 'embed') videoId = pathParts[2];
            }
        }
    } catch (e) {
        console.error("Invalid YouTube URL provided:", url, e);
        return null;
    }

    if (videoId) {
        const finalVideoId = videoId.split('?')[0];
        return `https://www.youtube.com/embed/${finalVideoId}?autoplay=1`;
    }
    
    return null;
};

// Helper to get a YouTube thumbnail from either a link or an embed code
const getYouTubeThumbnail = (link?: string, embedCode?: string): string => {
    let urlForIdExtraction = link;
    if (!urlForIdExtraction && embedCode) {
        const srcMatch = embedCode.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
            urlForIdExtraction = srcMatch[1];
        }
    }

    if (!urlForIdExtraction) return `https://placehold.co/400x225.png`;
    
    let videoId: string | null = null;
    try {
        const urlObj = new URL(urlForIdExtraction);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
            if (!videoId) {
                const pathParts = urlObj.pathname.split('/');
                if (pathParts[1] === 'shorts') videoId = pathParts[2];
                else if (pathParts[1] === 'embed') videoId = pathParts[2];
            }
        }
    } catch (e) { /* Invalid URL */ }

    if (videoId) {
        const finalVideoId = videoId.split('?')[0];
        return `https://img.youtube.com/vi/${finalVideoId}/hqdefault.jpg`;
    }
    return `https://placehold.co/400x225.png`;
};


export default function VideoLecturesPage() {
    const { t } = useLanguage();
    const [lectures, setLectures] = useState<VideoLecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getVideoLectures()
            .then(setLectures)
            .catch(err => console.error("Failed to fetch video lectures:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <VideoIcon className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('videoLectures')}</h1>
                <p className="text-muted-foreground">Watch our recorded video lectures.</p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : lectures.length === 0 ? (
                 <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No video lectures available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lectures.map(lecture => {
                        const embedUrl = lecture.link ? getYouTubeEmbedUrl(lecture.link) : null;
                        const canPlay = lecture.embedCode || embedUrl;
                        return (
                         <Card key={lecture.id} className="flex flex-col transition-transform hover:scale-105">
                            <img 
                                src={getYouTubeThumbnail(lecture.link, lecture.embedCode)} 
                                alt={lecture.title} 
                                className="rounded-t-lg object-cover w-full aspect-video"
                            />
                            <CardHeader>
                                <CardTitle>{lecture.title}</CardTitle>
                                <p className="text-sm text-muted-foreground pt-1">{format(lecture.createdAt.toDate(), 'PPP')}</p>
                            </CardHeader>
                            <CardContent className="flex-grow"></CardContent>
                            <CardFooter>
                                <Dialog>
                                     <DialogTrigger asChild>
                                        <Button className="w-full" disabled={!canPlay}>
                                            <VideoIcon className="mr-2 h-4 w-4" />
                                            Watch Video
                                        </Button>
                                    </DialogTrigger>
                                     {canPlay && (
                                        <DialogContent className="max-w-3xl w-[90vw] aspect-video p-0 border-0">
                                            {lecture.embedCode ? (
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: lecture.embedCode.replace(/width="[^"]*"/g, 'width="100%"').replace(/height="[^"]*"/g, 'height="100%"') }}
                                                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-lg"
                                                />
                                            ) : (
                                                <iframe
                                                    className="w-full h-full rounded-lg"
                                                    src={embedUrl!}
                                                    title={lecture.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                ></iframe>
                                            )}
                                        </DialogContent>
                                     )}
                                </Dialog>
                            </CardFooter>
                         </Card>
                    )})}
                </div>
            )}
        </div>
    );
}
