
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  title: string;
  subject: string;
  type: "youtube" | "local";
  url: string;
  thumbnailUrl: string;
  dataAiHint: string;
}

// Hardcoded initial data
const initialVideoData = {
  en: [
    { id: 'h_vid001', title: "Algebra Basics - Part 1", subject: "Mathematics", type: "youtube" as "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "math algebra" },
    { id: 'h_vid002', title: "Indian History: Freedom Struggle", subject: "General Knowledge", type: "local" as "local", url: "/videos/history.mp4", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "history india" },
    { id: 'h_vid003', title: "English Grammar: Tenses", subject: "English", type: "youtube" as "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "english grammar" },
  ],
  hi: [
    { id: 'h_vid001', title: "बीजगणित मूल बातें - भाग 1", subject: "गणित", type: "youtube" as "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "math algebra" },
    { id: 'h_vid002', title: "भारतीय इतिहास: स्वतंत्रता संग्राम", subject: "सामान्य ज्ञान", type: "local" as "local", url: "/videos/history.mp4", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "history india" },
    { id: 'h_vid003', title: "अंग्रेजी व्याकरण: काल", subject: "अंग्रेज़ी", type: "youtube" as "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png", dataAiHint: "english grammar" },
  ]
};

const USER_VIDEOS_STORAGE_KEY = 'userAddedVideos';

// NOTE: This is a placeholder for actual admin authentication.
const isAdmin = true;

export default function VideosPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [videosToDisplay, setVideosToDisplay] = useState<VideoItem[]>([]);

  useEffect(() => {
    const storedUserVideosString = localStorage.getItem(USER_VIDEOS_STORAGE_KEY);
    let userVideos: VideoItem[] = [];
    if (storedUserVideosString) {
      try {
        userVideos = JSON.parse(storedUserVideosString);
      } catch (e) {
        console.error("Error parsing user videos from localStorage", e);
      }
    }
    // For this prototype, user-added videos are language-agnostic and shown for current language.
    // A more complex system would store language-specific user videos.
    const currentLangInitialVideos = initialVideoData[language] || [];
    setVideosToDisplay([...currentLangInitialVideos, ...userVideos]);
  }, [language]);

  const saveUserVideosToLocalStorage = (data: VideoItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_VIDEOS_STORAGE_KEY, JSON.stringify(data));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUploadVideo = () => {
    if (uploadFile && isAdmin) {
      const newVideo: VideoItem = {
        id: `user_vid_${Date.now()}`,
        title: uploadFile.name,
        subject: t('subject') || "Uploaded Video",
        type: "local", // Assume uploaded files are local
        url: `/uploads/prototype_${uploadFile.name}`, // Mock URL, won't play
        thumbnailUrl: "https://placehold.co/600x400.png",
        dataAiHint: "uploaded video",
      };

      const storedUserVideosString = localStorage.getItem(USER_VIDEOS_STORAGE_KEY);
      let userVideos: VideoItem[] = [];
      if (storedUserVideosString) {
         try { userVideos = JSON.parse(storedUserVideosString); } catch(e) { console.error("Error parsing videos", e)}
      }
      const updatedUserVideos = [...userVideos, newVideo];
      saveUserVideosToLocalStorage(updatedUserVideos);

      const currentLangInitialVideos = initialVideoData[language] || [];
      setVideosToDisplay([...currentLangInitialVideos, ...updatedUserVideos]);
      
      toast({
        title: t('uploadVideo') + " " + (t('registrationSuccess') || "Successful!"),
        description: `${uploadFile.name} ${t('liveClassAddedSuccess') || 'added successfully.'}`,
      });
      setUploadFile(null);
    }
  };

  const currentVideoForPlayer = videosToDisplay.find(v => v.url === selectedVideoUrl);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navVideos')}</h1>

      {isAdmin && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('uploadVideo') || 'Upload New Video'}</CardTitle>
            <CardDescription>{t('uploadVideoDesc') || 'Upload new video lectures for students. (Admin only)'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                className="max-w-sm border-input focus:ring-primary"
                aria-label={t('selectFile')}
              />
              <Button onClick={handleUploadVideo} disabled={!uploadFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <UploadCloud className="mr-2 h-4 w-4" /> {t('uploadVideo') || 'Upload Video'}
              </Button>
            </div>
            {uploadFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {uploadFile.name}</p>}
          </CardContent>
        </Card>
      )}
      
      {selectedVideoUrl && currentVideoForPlayer && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">
              {currentVideoForPlayer.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentVideoForPlayer.type === 'youtube' ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentVideoForPlayer.url} // Use currentVideoForPlayer.url here
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
              </div>
            ) : (
               <div className="aspect-video bg-black flex items-center justify-center rounded-md">
                {/* For local videos, actual playback won't work with mock URL. Show placeholder. */}
                <p className="text-background/70">{t('videoLectures')} ({currentVideoForPlayer.title}) - {t('adminUploadOnly')}</p>
                {/* 
                <video width="100%" height="100%" controls className="rounded-md">
                  <source src={currentVideoForPlayer.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video> 
                */}
              </div>
            )}
             <Button onClick={() => setSelectedVideoUrl(null)} className="mt-4" variant="outline">Close Player</Button>
          </CardContent>
        </Card>
      )}

      {videosToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videosToDisplay.map((video) => (
            <Card key={video.id} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="relative aspect-video cursor-pointer group" onClick={() => setSelectedVideoUrl(video.url)}>
                <Image 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  data-ai-hint={video.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-headline text-primary">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('subject') || 'Subject'}: {video.subject}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <p className="text-center text-muted-foreground py-8">{t('noRegistrations')}</p> 
      )}
       <p className="text-center text-sm text-muted-foreground">
        Note: Video data you add is stored in your browser's local storage. Videos are not actually uploaded or playable if added locally in this prototype.
      </p>
    </div>
  );
}

