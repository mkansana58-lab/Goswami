
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DownloadCloud, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

export default function DownloadsPage() {
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

        // Group files by category
        const groups: GroupedFiles = {};
        fetchedFiles.forEach(file => {
          if (!groups[file.category]) {
            groups[file.category] = [];
          }
          groups[file.category].push(file);
        });
        setGroupedFiles(groups);

      } catch (error: any) {
        console.error("Error fetching downloadable files from Firestore:", error);
        setFetchError(`${t('fetchErrorDetails') || "Failed to load files."} ${error.message ? `(${error.message})` : ''}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [t]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <DownloadCloud className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navDownloads')}</CardTitle>
          <CardDescription className="text-lg">{t('downloadsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          )}

          {fetchError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorOccurred')}</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !fetchError && Object.keys(groupedFiles).length === 0 && (
            <p className="text-center text-muted-foreground py-10">{t('noDownloadsAvailable') || "No downloadable files available at the moment."}</p>
          )}

          {!isLoading && !fetchError && Object.keys(groupedFiles).length > 0 && (
            Object.entries(groupedFiles).map(([category, categoryFiles]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-secondary-foreground mb-3 border-b pb-2">{t(category as any) || category}</h2>
                <div className="space-y-3">
                  {categoryFiles.map((file) => (
                    <Card key={file.id} className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-secondary-foreground truncate" title={file.name}>{file.name}</p>
                          <p className="text-sm text-muted-foreground truncate" title={file.fileName}>{file.fileName}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.fileName}>
                          <DownloadCloud className="mr-2 h-4 w-4" /> {t('download')}
                        </a>
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
        {isAdmin && !isLoading && (
          <CardFooter>
            <p className="text-xs text-muted-foreground mx-auto text-center">
              {t('adminManageDownloadsNote') || "Admin: Manage files by uploading to Firebase Storage and adding metadata to 'downloadableFiles' collection in Firestore."}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Add to translations:
// noDownloadsAvailable: "No downloadable files available at the moment." (EN)
// noDownloadsAvailable: "फिलहाल कोई डाउनलोड करने योग्य फ़ाइलें उपलब्ध नहीं हैं।" (HI)
// adminManageDownloadsNote: "Admin: Manage files by uploading to Firebase Storage and adding metadata to 'downloadableFiles' collection in Firestore." (EN)
// adminManageDownloadsNote: "एडमिन: Firebase Storage में फ़ाइलें अपलोड करके और Firestore में 'downloadableFiles' कलेक्शन में मेटाडेटा जोड़कर फ़ाइलों का प्रबंधन करें।" (HI)
// And potentially category keys like "Syllabus", "Mock Tests", "Notes", "Previous Year Papers" if you want them translated
// Syllabus: "Syllabus" (EN), "सिलेबस" (HI)
// MockTests: "Mock Tests" (EN), "मॉक टेस्ट" (HI)
// Notes: "Notes" (EN), "नोट्स" (HI)
// PreviousYearPapers: "Previous Year Papers" (EN), "पिछले वर्ष के प्रश्नपत्र" (HI)

