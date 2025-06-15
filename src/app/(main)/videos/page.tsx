
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, UploadCloud, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VideoItemFirestore {
  id: string; // Firestore document ID
  title: string;
  subject: string;
  type: "youtube" | "local"; // "local" means placeholder for future direct upload
  url: string; // YouTube embed URL or placeholder path
  thumbnailUrl: string; // URL for the thumbnail image
  dataAiHint: string; // Hint for AI image generation if thumbnail is placeholder
  addedAt: Timestamp;
  fileName?: string; // For user uploaded "local" type videos (metadata only)
}

const VIDEOS_COLLECTION = 'videosFS';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export default function VideosPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(Date.now()); // To reset file input

  const [videosToDisplay, setVideosToDisplay] = useState<VideoItemFirestore[]>([]);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const videosQuery = query(collection(db, VIDEOS_COLLECTION), orderBy("addedAt", "desc"));
      const videosSnapshot = await getDocs(videosQuery);
      const fetchedVideos: VideoItemFirestore[] = [];
      videosSnapshot.forEach((doc) => {
        fetchedVideos.push({ id: doc.id, ...doc.data() } as VideoItemFirestore);
      });
      setVideosToDisplay(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos from Firestore:", error);
      setFetchError(t('errorOccurred') + " " + "Could not load video data from Firestore. Please check console and Firebase setup.");
      toast({
        title: t('errorOccurred'),
        description: "Failed to load videos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isClient) {
      fetchVideos();
    }
  }, [isClient, language]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    } else {
      setUploadFile(null);
    }
  };

  const handleUploadVideo = async () => {
    if (uploadFile && showAdminFeatures) {
      setIsSubmitting(true);
      try {
        const newVideoPayload: Omit<VideoItemFirestore, 'id'> = {
          title: uploadFile.name.replace(/\.[^/.]+$/, ""), // Use file name as title (without extension)
          subject: t('subject') || "Uploaded Video",
          type: "local", // Mark as local, actual file not uploaded to storage in prototype
          url: `/uploads/prototype_${uploadFile.name}`, // Placeholder URL
          thumbnailUrl: "https://placehold.co/600x400.png", // Default placeholder
          dataAiHint: "uploaded video",
          addedAt: Timestamp.now(),
          fileName: uploadFile.name,
        };

        await addDoc(collection(db, VIDEOS_COLLECTION), newVideoPayload);
        
        toast({
          title: t('uploadVideo') + " " + (t('registrationSuccess') || "Successful!"),
          description: `${uploadFile.name} ${t('liveClassAddedSuccess') || 'metadata added successfully.'}`,
        });
        setUploadFile(null);
        setInputKey(Date.now()); // Reset file input
        fetchVideos(); // Refresh list
      } catch (error) {
         console.error("Error adding video to Firestore:", error);
        toast({
          title: t('errorOccurred'),
          description: "Could not save video metadata. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentVideoForPlayer = videosToDisplay.find(v => v.url === selectedVideoUrl);

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navVideos')}</h1>

      {showAdminFeatures && (
        <Card className="shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('uploadVideo') || 'Upload New Video'}</CardTitle>
            <CardDescription>{t('uploadVideoDesc') || 'Upload new video lectures for students. (Admin only)'} (This will add video metadata to Firestore. Actual file upload is not implemented.)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                key={inputKey} // Used to reset input
                id="video-file-upload"
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                className="max-w-sm border-input focus:ring-primary"
                aria-label={t('selectFile')}
              />
              <Button onClick={handleUploadVideo} disabled={!uploadFile || isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isSubmitting ? t('loading') : (t('uploadVideo') || 'Upload Video')}
              </Button>
            </div>
            {uploadFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {uploadFile.name}</p>}
          </CardContent>
        </Card>
      )}

      {fetchError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('errorOccurred')}</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      
      {selectedVideoUrl && currentVideoForPlayer && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">
              {currentVideoForPlayer.title}
            </CardTitle>
             <CardDescription>{t('subject')}: {currentVideoForPlayer.subject}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentVideoForPlayer.type === 'youtube' ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentVideoForPlayer.url} // Assumes valid YouTube embed URL
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
              </div>
            ) : ( // For 'local' type or any other
               <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground p-4 text-center">
                  {t('videoLectures')} ({currentVideoForPlayer.title}) - Playback for locally added videos is not implemented in this prototype.
                  {currentVideoForPlayer.fileName && <span className="block text-sm">File: {currentVideoForPlayer.fileName}</span>}
                </p>
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
                  onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'} // Fallback
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-headline text-primary truncate" title={video.title}>{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('subject') || 'Subject'}: {video.subject}</CardDescription>
                {video.fileName && video.type === 'local' && <p className="text-xs text-muted-foreground truncate">File: {video.fileName}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         !fetchError && <p className="text-center text-muted-foreground py-8">{t('noRegistrations').replace('registrations', 'videos')}</p> 
      )}
       <p className="text-center text-sm text-muted-foreground">
        {t('localStorageNote').replace('local storage', 'Firebase Firestore')}. Videos are not actually uploaded or fully playable if added locally in this prototype.
      </p>
    </div>
  );
}

