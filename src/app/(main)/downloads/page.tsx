
"use client";
// This page's public content is now part of the Learning Hub.
// This page can be kept for admin reference as it doesn't have forms.

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DownloadCloud, FileText, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const DOWNLOADS_COLLECTION = 'downloadableFiles';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

interface DownloadableFile {
  id: string;
  name: string;
  fileName: string;
  downloadURL: string;
  category: string;
  addedAt: Timestamp;
}

interface GroupedFiles {
  [category: string]: DownloadableFile[];
}

export default function AdminDownloadsPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [groupedFiles, setGroupedFiles] = useState<GroupedFiles>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const q = query(collection(db, DOWNLOADS_COLLECTION), orderBy("category"), orderBy("addedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedFiles: DownloadableFile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedFiles.push({ id: doc.id, ...doc.data() } as DownloadableFile);
        });
        setFiles(fetchedFiles);

        const groups: GroupedFiles = {};
        fetchedFiles.forEach(file => {
          if (!groups[file.category]) { groups[file.category] = []; }
          groups[file.category].push(file);
        });
        setGroupedFiles(groups);

      } catch (error: any) {
        setFetchError(`${t('fetchErrorDetails')} ${error.message ? `(${error.message})` : ''}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [t]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4"><DownloadCloud className="h-16 w-16 text-primary" /></div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('adminManageDownloads') || "Manage Downloads (Admin)"}</CardTitle>
          <CardDescription className="text-lg">{t('adminManageDownloadsDesc')}</CardDescription>
           <Button variant="outline" asChild className="mt-2">
            <Link href="/learning-hub?tab=downloads">
              {t('viewPublicPage') || "View Public Downloads Page"} <ExternalLink className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {fetchError && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('errorOccurred')}</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>)}
          {!isLoading && !fetchError && Object.keys(groupedFiles).length === 0 && (<p className="text-center text-muted-foreground py-10">{t('noDownloadsAvailable')}</p>)}
          {!isLoading && !fetchError && Object.keys(groupedFiles).length > 0 && (
            Object.entries(groupedFiles).map(([category, categoryFiles]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-secondary-foreground mb-3 border-b pb-2">{t(category as any) || category}</h2>
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
        </CardContent>
        {isAdmin && !isLoading && (
          <CardFooter><p className="text-xs text-muted-foreground mx-auto text-center">{t('adminManageDownloadsNote')}</p></CardFooter>
        )}
      </Card>
    </div>
  );
}
