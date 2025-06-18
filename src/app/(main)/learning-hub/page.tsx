
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tv2, PlaySquare, DownloadCloud, Loader2, FileText, AlertTriangle, Youtube } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// Types from original pages, slightly adapted
interface LiveClassData {
  id: string;
  title: string;
  subject: string;
  link: string;
  scheduledAt: Timestamp;
  createdAt: Timestamp;
}

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

interface DownloadableFile {
  id: string;
  name: string;
  fileName: string;
  downloadURL: string;
  category: string;
  addedAt: Timestamp;
}
interface GroupedDownloads {
  [category: string]: DownloadableFile[];
}


const LIVE_CLASSES_COLLECTION = 'liveClasses';
const VIDEOS_COLLECTION = 'videosFS';
const DOWNLOADS_COLLECTION = 'downloadableFiles';
const YOUTUBE_CHANNEL_LINK = "https://youtube.com/@mohitkansana-s1h?si=jZgFU7nBEj_4_XTX";

export default function LearningHubPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // States for Live Classes
  const [liveClassesToDisplay, setLiveClassesToDisplay] = useState<LiveClassData[]>([]);
  const [isLoadingLiveClasses, setIsLoadingLiveClasses] = useState(true);
  const [fetchErrorLiveClasses, setFetchErrorLiveClasses] = useState<string | null>(null);

  // States for Videos
  const [videosToDisplay, setVideosToDisplay] = useState<VideoItemFirestore[]>([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [fetchErrorVideos, setFetchErrorVideos] = useState<string | null>(null);

  // States for Downloads
  const [downloadableFiles, setDownloadableFiles] = useState<DownloadableFile[]>([]);
  const [groupedDownloadableFiles, setGroupedDownloadableFiles] = useState<GroupedDownloads>({});
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);
  const [fetchErrorDownloads, setFetchErrorDownloads] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Live Classes
  useEffect(() => {
    if (!isClient) return;
    setIsLoadingLiveClasses(true);
    setFetchErrorLiveClasses(null);
    console.log("LearningHub: Setting up Live Classes listener.");
    const q = query(collection(db, LIVE_CLASSES_COLLECTION), orderBy("scheduledAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date();
      const fetchedClasses: LiveClassData[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.scheduledAt && typeof data.scheduledAt.toDate === 'function') {
          const scheduledDateTime = data.scheduledAt.toDate();
          if (scheduledDateTime > now) {
            fetchedClasses.push({ id: docSnap.id, ...data } as LiveClassData);
          }
        }
      });
      setLiveClassesToDisplay(fetchedClasses);
      setIsLoadingLiveClasses(false);
    }, (error) => {
      console.error("LearningHub: Error fetching live classes:", error);
      setFetchErrorLiveClasses(t('fetchErrorDetails'));
      setIsLoadingLiveClasses(false);
    });
    return () => unsubscribe();
  }, [isClient, t]);

  // Fetch Videos
  useEffect(() => {
    if (!isClient) return;
    setIsLoadingVideos(true);
    setFetchErrorVideos(null);
    const q = query(collection(db, VIDEOS_COLLECTION), orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedVideos: VideoItemFirestore[] = [];
      querySnapshot.forEach((doc) => {
        fetchedVideos.push({ id: doc.id, ...doc.data() } as VideoItemFirestore);
      });
      setVideosToDisplay(fetchedVideos);
      setIsLoadingVideos(false);
    }, (error) => {
      console.error("LearningHub: Error fetching videos:", error);
      setFetchErrorVideos(t('fetchErrorDetails'));
      setIsLoadingVideos(false);
    });
    return () => unsubscribe();
  }, [isClient, t]);

  // Fetch Downloads
  useEffect(() => {
    if (!isClient) return;
    setIsLoadingDownloads(true);
    setFetchErrorDownloads(null);
    const q = query(collection(db, DOWNLOADS_COLLECTION), orderBy("category"), orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedFiles: DownloadableFile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedFiles.push({ id: doc.id, ...doc.data() } as DownloadableFile);
      });
      setDownloadableFiles(fetchedFiles);

      const groups: GroupedDownloads = {};
      fetchedFiles.forEach(file => {
        if (!groups[file.category]) { groups[file.category] = []; }
        groups[file.category].push(file);
      });
      setGroupedDownloadableFiles(groups);
      setIsLoadingDownloads(false);
    }, (error) => {
      console.error("LearningHub: Error fetching downloads:", error);
      setFetchErrorDownloads(t('fetchErrorDetails'));
      setIsLoadingDownloads(false);
    });
    return () => unsubscribe();
  }, [isClient, t]);


  const getYouTubeEmbedUrl = (url: string | undefined): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname === "/watch") {
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname.startsWith("/live/")) {
         const videoId = urlObj.pathname.split('/live/')[1]?.split('?')[0];
         return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname.startsWith("/embed/")) return url;
    } catch (e) { console.warn("Could not parse YouTube URL:", url, e); }
    return "";
  };

  const formatScheduledTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return t('invalidDateLabel');
    try {
      return timestamp.toDate().toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'long', timeStyle: 'short' });
    } catch (e) { return t('invalidDateLabel'); }
  };
  
  const currentVideoForPlayer = videosToDisplay.find(v => v.url === selectedVideoUrl);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4"><Tv2 className="h-16 w-16 text-primary" /></div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navLearningHub')}</CardTitle>
          <CardDescription className="text-lg">{t('learningHubDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="live-classes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="live-classes">{t('navLiveClasses')}</TabsTrigger>
              <TabsTrigger value="videos">{t('navVideos')}</TabsTrigger>
              <TabsTrigger value="downloads">{t('navDownloads')}</TabsTrigger>
            </TabsList>

            {/* Live Classes Tab */}
            <TabsContent value="live-classes">
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-2xl font-semibold text-secondary-foreground mb-2 text-center">{t('upcomingLiveClasses')}</h3>
                 <Button asChild variant="outline" size="sm" className="mb-4 bg-red-50 hover:bg-red-100 border-red-600 text-red-700">
                    <a href={YOUTUBE_CHANNEL_LINK} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-4 w-4" /> {t('viewLiveScheduleButton') || "View Full Schedule on YouTube"}
                    </a>
                </Button>
              </div>
              {isLoadingLiveClasses && !fetchErrorLiveClasses ? (
                <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
              ) : fetchErrorLiveClasses ? (
                <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchErrorLiveClasses}</AlertDescription></Alert>
              ) : liveClassesToDisplay.length > 0 ? (
                <div className="space-y-6">
                  {liveClassesToDisplay.map((liveClass) => {
                    const embedUrl = getYouTubeEmbedUrl(liveClass.link);
                    return (
                      <Card key={liveClass.id} className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-xl text-primary">{liveClass.title}</CardTitle>
                          <CardDescription className="text-sm">{t('subject')}: {liveClass.subject}</CardDescription>
                          <p className="text-sm text-muted-foreground pt-1">{t('navSchedule')}: {formatScheduledTime(liveClass.scheduledAt)}</p>
                        </CardHeader>
                        <CardContent>
                          {embedUrl ? (
                            <div className="aspect-video rounded-md overflow-hidden">
                              <iframe width="100%" height="100%" src={embedUrl} title={liveClass.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            </div>
                          ) : (
                             <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
                               <a href={liveClass.link} target="_blank" rel="noopener noreferrer">{t('joinClassButton')}</a>
                             </Button>
                          )}
                           {!embedUrl && liveClass.link && liveClass.link !== "#" && (
                             <p className="text-xs text-muted-foreground mt-2 text-center">{t('noPreviewAvailable')}</p>
                           )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">{t('noLiveClassesScheduled')}</p>
              )}
            </TabsContent>

            {/* Video Classes Tab */}
            <TabsContent value="videos">
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-2xl font-semibold text-secondary-foreground mb-2 text-center">{t('videoLectures')}</h3>
                <Button asChild variant="outline" size="sm" className="mb-4 bg-red-50 hover:bg-red-100 border-red-600 text-red-700">
                    <a href={YOUTUBE_CHANNEL_LINK} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-4 w-4" /> {t('watchMoreVideosButton') || "Watch More on YouTube"}
                    </a>
                </Button>
              </div>
              {selectedVideoUrl && currentVideoForPlayer ? (
                <Card className="shadow-lg mt-4">
                  <CardHeader><CardTitle className="text-xl font-headline text-primary">{currentVideoForPlayer.title}</CardTitle><CardDescription>{t('subject')}: {currentVideoForPlayer.subject}</CardDescription></CardHeader>
                  <CardContent>
                    {currentVideoForPlayer.type === 'youtube' ? (
                      <div className="aspect-video"><iframe width="100%" height="100%" src={currentVideoForPlayer.url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-md"></iframe></div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center rounded-md"><p className="text-muted-foreground p-4 text-center">{t('videoLectures')} ({currentVideoForPlayer.title}) - Playback for locally added videos is not implemented. {currentVideoForPlayer.fileName && <span className="block text-sm">File: {currentVideoForPlayer.fileName}</span>}</p></div>
                    )}
                    <Button onClick={() => setSelectedVideoUrl(null)} className="mt-4" variant="outline">{t('closePlayer') || "Close Player"}</Button>
                  </CardContent>
                </Card>
              ) : null}
              {isLoadingVideos && !fetchErrorVideos ? (
                <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
              ) : fetchErrorVideos ? (
                <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchErrorVideos}</AlertDescription></Alert>
              ) : videosToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {videosToDisplay.map((video) => (
                    <Card key={video.id} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                      <div className="relative aspect-video cursor-pointer group" onClick={() => setSelectedVideoUrl(video.url)}>
                        <Image src={video.thumbnailUrl} alt={video.title} width={600} height={400} className="w-full h-full object-cover" data-ai-hint={video.dataAiHint} onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400.png'} />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><PlaySquare className="h-16 w-16 text-white" /></div>
                      </div>
                      <CardHeader><CardTitle className="text-lg font-headline text-primary truncate" title={video.title}>{video.title}</CardTitle></CardHeader>
                      <CardContent><CardDescription>{t('subject')}: {video.subject}</CardDescription>{video.fileName && video.type === 'local' && <p className="text-xs text-muted-foreground truncate">File: {video.fileName}</p>}</CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t('noVideosAvailable') || "No videos available."}</p>
              )}
            </TabsContent>

            {/* Downloads Tab */}
            <TabsContent value="downloads">
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-2xl font-semibold text-secondary-foreground mb-2 text-center">{t('navDownloads')}</h3>
                 <Button asChild variant="outline" size="sm" className="mb-4 bg-red-50 hover:bg-red-100 border-red-600 text-red-700">
                    <a href={YOUTUBE_CHANNEL_LINK} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-4 w-4" /> {t('downloadMoreButton') || "More Resources on YouTube"}
                    </a>
                </Button>
              </div>
              {isLoadingDownloads && !fetchErrorDownloads ? (
                <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
              ) : fetchErrorDownloads ? (
                <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchErrorDownloads}</AlertDescription></Alert>
              ) : Object.keys(groupedDownloadableFiles).length === 0 ? (
                <p className="text-center text-muted-foreground py-10">{t('noDownloadsAvailable')}</p>
              ) : (
                Object.entries(groupedDownloadableFiles).map(([category, categoryFiles]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-xl font-semibold text-secondary-foreground mb-3 border-b pb-2">{t(category as any) || category}</h3>
                    <div className="space-y-3">
                      {categoryFiles.map((file) => (
                        <Card key={file.id} className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-accent flex-shrink-0" /><div className="overflow-hidden"><p className="font-semibold text-secondary-foreground truncate" title={file.name}>{file.name}</p><p className="text-sm text-muted-foreground truncate" title={file.fileName}>{file.fileName}</p></div></div>
                          <Button variant="outline" size="sm" asChild><a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.fileName}><DownloadCloud className="mr-2 h-4 w-4" /> {t('download')}</a></Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

    
