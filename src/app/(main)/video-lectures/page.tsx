
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getVideoLectures, type VideoLecture } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
            <div className="flex flex-col items-center text-center">
                <Video className="h-12 w-12 text-primary" />
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
                        const embedUrl = getYouTubeEmbedUrl(lecture.videoUrl);
                        return (
                        <Dialog key={lecture.id}>
                             <DialogTrigger asChild>
                                 <Card className="flex flex-col cursor-pointer transition-transform hover:scale-105">
                                    <img 
                                        src={getYouTubeThumbnail(lecture.videoUrl)} 
                                        alt={lecture.title} 
                                        className="rounded-t-lg object-cover w-full aspect-video"
                                    />
                                    <CardHeader>
                                        <CardTitle>{lecture.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground pt-1">{format(lecture.createdAt.toDate(), 'PPP')}</p>
                                    </CardHeader>
                                    <CardContent className="flex-grow"></CardContent>
                                    <CardFooter>
                                        <Button className="w-full">
                                            <Video className="mr-2 h-4 w-4" />
                                            Watch Video
                                        </Button>
                                    </CardFooter>
                                 </Card>
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
                    )})}
                </div>
            )}
        </div>
    );
}
