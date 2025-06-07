
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, {useState} from 'react';

// Placeholder data
const videoData = {
  en: [
    { id: 'vid001', title: "Algebra Basics - Part 1", subject: "Mathematics", type: "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png?text=Algebra+Basics", dataAiHint: "math lecture" },
    { id: 'vid002', title: "Indian History: Freedom Struggle", subject: "General Knowledge", type: "local", url: "/videos/history.mp4", thumbnailUrl: "https://placehold.co/600x400.png?text=Indian+History", dataAiHint: "history class" },
    { id: 'vid003', title: "English Grammar: Tenses", subject: "English", type: "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png?text=English+Grammar", dataAiHint: "english lesson" },
  ],
  hi: [
    { id: 'vid001', title: "बीजगणित मूल बातें - भाग 1", subject: "गणित", type: "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png?text=बीजगणित", dataAiHint: "math lecture" },
    { id: 'vid002', title: "भारतीय इतिहास: स्वतंत्रता संग्राम", subject: "सामान्य ज्ञान", type: "local", url: "/videos/history.mp4", thumbnailUrl: "https://placehold.co/600x400.png?text=भारतीय+इतिहास", dataAiHint: "history class" },
    { id: 'vid003', title: "अंग्रेजी व्याकरण: काल", subject: "अंग्रेज़ी", type: "youtube", url: "https://www.youtube.com/embed/ மதுரைவீரன்", thumbnailUrl: "https://placehold.co/600x400.png?text=अंग्रेजी+व्याकरण", dataAiHint: "english lesson" },
  ]
};


export default function VideosPage() {
  const { t, language } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUploadVideo = () => {
    if (uploadFile) {
      // Placeholder for video upload logic
      alert(`${t('uploadVideo') || 'Upload Video'}: ${uploadFile.name}`);
      setUploadFile(null);
    }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navVideos')}</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">{t('uploadVideo') || 'Upload New Video'}</CardTitle>
          <CardDescription>{t('uploadVideoDesc') || 'Upload new video lectures for students. (Admin only)'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input type="file" accept="video/*" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleUploadVideo} disabled={!uploadFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <UploadCloud className="mr-2 h-4 w-4" /> {t('uploadVideo') || 'Upload Video'}
            </Button>
          </div>
          {uploadFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {uploadFile.name}</p>}
        </CardContent>
      </Card>
      
      {selectedVideo && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">
              {videoData[language].find(v => v.url === selectedVideo)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videoData[language].find(v => v.url === selectedVideo)?.type === 'youtube' ? (
              <iframe
                width="100%"
                height="480"
                src={selectedVideo}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            ) : (
              <video width="100%" height="480" controls className="rounded-md">
                <source src={selectedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
             <Button onClick={() => setSelectedVideo(null)} className="mt-4" variant="outline">Close Player</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoData[language].map((video) => (
          <Card key={video.id} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
            <div className="relative aspect-video cursor-pointer group" onClick={() => setSelectedVideo(video.url)}>
              <Image 
                src={video.thumbnailUrl} 
                alt={video.title} 
                layout="fill" 
                objectFit="cover" 
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
    </div>
  );
}

// Add these keys to translations.ts if not present:
// subject: "Subject"
// uploadVideo: "Upload New Video"
// uploadVideoDesc: "Upload new video lectures for students. (Admin only)"
// download: "Download"
// date: "Date"
// year: "Year"
