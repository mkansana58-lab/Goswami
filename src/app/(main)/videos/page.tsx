
"use client";
// This page's public content is now part of the Learning Hub.
// This page can be kept for admin-specific functionalities.

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaySquare, UploadCloud, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface VideoItemFirestore {
  id: string;
  title: string;
  subject: string;
  type: "youtube" | "local";
  url: string;
  thumbnailUrl: string;
  dataAiHint: string;
  addedAt: Timestamp;
  fileName?: string;
}

const VIDEOS_COLLECTION = 'videosFS';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export default function AdminVideosPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState(''); // New state for title
  const [videoSubject, setVideoSubject] = useState(''); // New state for subject
  const [videoUrl, setVideoUrl] = useState(''); // New state for URL (for YouTube)
  const [videoType, setVideoType] = useState<'youtube' | 'local'>('youtube'); // New state for type
  const [inputKey, setInputKey] = useState(Date.now());

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
      setFetchError(t('errorOccurred') + " " + t('fetchErrorDetails'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { if (isClient) fetchVideos(); }, [isClient, language, t]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
      if (!videoTitle) setVideoTitle(event.target.files[0].name.replace(/\.[^/.]+$/, "")); // Autofill title
    } else {
      setUploadFile(null);
    }
  };

  const handleAddVideo = async () => {
    if (!showAdminFeatures || !videoTitle || !videoSubject) {
        toast({ title: t('errorOccurred'), description: t('videoAdminValidation'), variant: 'destructive'});
        return;
    }
    if (videoType === 'youtube' && !videoUrl) {
        toast({ title: t('errorOccurred'), description: t('youtubeUrlRequired'), variant: 'destructive'});
        return;
    }
    if (videoType === 'local' && !uploadFile) {
        toast({ title: t('errorOccurred'), description: t('fileRequiredForLocal'), variant: 'destructive'});
        return;
    }

    setIsSubmitting(true);
    try {
      let newVideoPayload: Omit<VideoItemFirestore, 'id' | 'addedAt'> & { addedAt: any } = { // Use any for serverTimestamp flexibility
        title: videoTitle,
        subject: videoSubject,
        type: videoType,
        url: videoType === 'youtube' ? videoUrl : `/uploads/prototype_${uploadFile?.name || 'local_video'}`,
        thumbnailUrl: videoType === 'youtube' ? getYouTubeThumbnail(videoUrl) : "https://placehold.co/600x400.png",
        dataAiHint: videoType === 'youtube' ? "youtube video" : "uploaded video",
        addedAt: Timestamp.now(), // Temporarily, will be replaced by serverTimestamp
      };
      
      if (videoType === 'local' && uploadFile) {
        newVideoPayload.fileName = uploadFile.name;
      }
      // Ensure addedAt is serverTimestamp for actual Firestore write
      const finalPayload = {...newVideoPayload, addedAt: serverTimestamp()};

      await addDoc(collection(db, VIDEOS_COLLECTION), finalPayload);
      
      toast({ title: t('videoAddedSuccess'), description: `${videoTitle} ${t('liveClassAddedSuccess')}`});
      setUploadFile(null);
      setVideoTitle('');
      setVideoSubject('');
      setVideoUrl('');
      setVideoType('youtube');
      setInputKey(Date.now());
      fetchVideos();
    } catch (error) {
       console.error("Error adding video to Firestore:", error);
      toast({ title: t('errorOccurred'), description: t('saveErrorDetails'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getYouTubeThumbnail = (youtubeUrl: string): string => {
    try {
      const urlObj = new URL(youtubeUrl);
      let videoId = null;
      if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.hostname.includes("youtube.com") && urlObj.pathname.startsWith("/live/")) {
        videoId = urlObj.pathname.split('/live/')[1]?.split('?')[0];
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // Or mqdefault.jpg, sddefault.jpg
      }
    } catch (e) { /* ignore error, return placeholder */ }
    return "https://placehold.co/600x400.png";
  };


  if (!isClient || (isLoading && videosToDisplay.length === 0)) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <PlaySquare className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('manageVideos')}</CardTitle>
          <CardDescription className="text-lg">{t('manageVideosDesc')}</CardDescription>
          <Button variant="outline" asChild className="mt-2">
            <Link href="/learning-hub?tab=videos">
              {t('viewPublicPage') || "View Public Videos Page"} <ExternalLink className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
        </CardHeader>

        {showAdminFeatures && (
          <CardContent className="border-t pt-6">
            <h3 className="text-xl font-semibold text-secondary-foreground mb-4">{t('uploadVideo') || 'Add New Video'}</h3>
            <div className="space-y-4">
              <div><label htmlFor="videoType" className="block text-sm font-medium text-foreground mb-1">{t('videoTypeLabel') || "Video Type"}</label>
                <select id="videoType" value={videoType} onChange={(e) => setVideoType(e.target.value as 'youtube' | 'local')} className="w-full p-2 border rounded-md">
                  <option value="youtube">{t('youtubeLink') || "YouTube Link"}</option>
                  <option value="local">{t('localFilePlaceholder') || "Local File (Metadata Only)"}</option>
                </select>
              </div>
              <div><label htmlFor="videoTitle" className="block text-sm font-medium text-foreground mb-1">{t('videoTitleLabel') || "Video Title"}</label><Input id="videoTitle" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder={t('videoTitlePlaceholder') || "Enter video title"} /></div>
              <div><label htmlFor="videoSubject" className="block text-sm font-medium text-foreground mb-1">{t('videoSubjectLabel') || "Subject"}</label><Input id="videoSubject" value={videoSubject} onChange={(e) => setVideoSubject(e.target.value)} placeholder={t('videoSubjectPlaceholder') || "Enter subject"} /></div>
              {videoType === 'youtube' && (<div><label htmlFor="videoUrl" className="block text-sm font-medium text-foreground mb-1">{t('videoUrlLabel') || "YouTube Video URL"}</label><Input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></div>)}
              {videoType === 'local' && (<div className="flex items-center space-x-2"><Input key={inputKey} id="video-file-upload" type="file" accept="video/*" onChange={handleFileChange} className="max-w-sm"/><label htmlFor="video-file-upload" className="text-sm text-muted-foreground">{uploadFile ? uploadFile.name : t('noFileChosen')}</label></div>)}
              <Button onClick={handleAddVideo} disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}{isSubmitting ? t('loading') : (t('addVideoButton') || 'Add Video')}</Button>
            </div>
          </CardContent>
        )}

        <CardContent className={(showAdminFeatures) ? "border-t pt-6" : "pt-6"}>
           <h3 className="text-2xl font-semibold text-secondary-foreground mb-6 text-center">{t('videoGalleryAdmin') || "Video Gallery (Admin View)"}</h3>
          {fetchError && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>)}
          {videosToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videosToDisplay.map((video) => (
                <Card key={video.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader><CardTitle className="text-md text-primary truncate" title={video.title}>{video.title}</CardTitle><CardDescription className="text-xs">{t('subject')}: {video.subject} | Type: {video.type}</CardDescription></CardHeader>
                  <CardContent><p className="text-xs text-muted-foreground truncate" title={video.url}>URL: {video.url}</p>{video.fileName && <p className="text-xs text-muted-foreground">File: {video.fileName}</p>}</CardContent>
                  {/* Admin might want delete/edit options here in future */}
                </Card>
              ))}
            </div>
          ) : (!fetchError && <p className="text-center text-muted-foreground py-4">{t('noVideosAvailable') || "No videos uploaded yet."}</p>)}
        </CardContent>
      </Card>
    </div>
  );
}
