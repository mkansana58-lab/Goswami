
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Download, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TestItemFirestore {
  id: string; // Firestore document ID
  name: string;
  date: string; // Stored as string, could be Timestamp if querying by date is needed
  subject: string;
  fileName?: string; // For user uploaded files
  addedAt: Timestamp;
}

interface PaperItemFirestore {
  id: string; // Firestore document ID
  name: string;
  year: string;
  fileName?: string;
  addedAt: Timestamp;
}

const MOCK_TESTS_COLLECTION = 'mockTestsFS';
const PREVIOUS_PAPERS_COLLECTION = 'previousPapersFS';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export default function TestsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(Date.now()); // To reset file input

  const [mockTests, setMockTests] = useState<TestItemFirestore[]>([]);
  const [previousPapers, setPreviousPapers] = useState<PaperItemFirestore[]>([]);
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

  const fetchTestsAndPapers = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Fetch Mock Tests
      const mockTestsQuery = query(collection(db, MOCK_TESTS_COLLECTION), orderBy("addedAt", "desc"));
      const mockTestsSnapshot = await getDocs(mockTestsQuery);
      const fetchedMockTests: TestItemFirestore[] = [];
      mockTestsSnapshot.forEach((doc) => {
        fetchedMockTests.push({ id: doc.id, ...doc.data() } as TestItemFirestore);
      });
      setMockTests(fetchedMockTests);

      // Fetch Previous Papers
      const previousPapersQuery = query(collection(db, PREVIOUS_PAPERS_COLLECTION), orderBy("addedAt", "desc"));
      const previousPapersSnapshot = await getDocs(previousPapersQuery);
      const fetchedPreviousPapers: PaperItemFirestore[] = [];
      previousPapersSnapshot.forEach((doc) => {
        fetchedPreviousPapers.push({ id: doc.id, ...doc.data() } as PaperItemFirestore);
      });
      setPreviousPapers(fetchedPreviousPapers);

    } catch (error) {
      console.error("Error fetching tests/papers from Firestore:", error);
      setFetchError(t('errorOccurred') + " " + "Could not load test data from Firestore. Please check console and Firebase setup.");
      toast({
        title: t('errorOccurred'),
        description: "Failed to load tests and papers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchTestsAndPapers();
    }
  }, [isClient, language]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && showAdminFeatures) {
      setIsSubmitting(true);
      try {
        const newTestPayload = {
          name: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension for name
          date: new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
          subject: t('subject') || "Uploaded", 
          fileName: selectedFile.name,
          addedAt: Timestamp.now(),
        };

        await addDoc(collection(db, MOCK_TESTS_COLLECTION), newTestPayload);
        
        toast({
          title: t('uploadTest') + " " + (t('registrationSuccess') || "Successful!"),
          description: `${selectedFile.name} ${t('liveClassAddedSuccess') || 'metadata added successfully.'}`,
        });
        setSelectedFile(null);
        setInputKey(Date.now()); // Reset file input
        fetchTestsAndPapers(); // Refresh list
      } catch (error) {
        console.error("Error adding test to Firestore:", error);
        toast({
          title: t('errorOccurred'),
          description: "Could not save test metadata. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
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
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navTests')}</h1>

      {showAdminFeatures && (
        <Card className="shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('uploadTest')}</CardTitle>
            <CardDescription>{t('adminUploadOnly')} (This will add mock test metadata to Firestore. Actual file upload is not implemented.)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                key={inputKey} // Used to reset the input field
                id="test-file-upload"
                type="file" 
                onChange={handleFileChange} 
                className="max-w-sm border-input focus:ring-primary" 
                aria-label={t('selectFile')}
              />
              <Button onClick={handleUpload} disabled={!selectedFile || isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                {isSubmitting ? t('loading') : t('uploadTest')}
              </Button>
            </div>
            {selectedFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {selectedFile.name}</p>}
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('mockTests')}</CardTitle>
            <CardDescription>Practice with our curated mock tests. (Data from Firestore)</CardDescription>
          </CardHeader>
          <CardContent>
            {mockTests.length > 0 ? (
              <ul className="space-y-3">
                {mockTests.map((test) => (
                  <li key={test.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-secondary-foreground">{test.name} ({test.subject})</p>
                      <p className="text-sm text-muted-foreground">{t('date') || 'Date'}: {test.date}</p>
                      {test.fileName && <p className="text-xs text-muted-foreground">File: {test.fileName}</p>}
                    </div>
                    <Button variant="outline" size="sm" disabled><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('noRegistrations')}</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('previousYearPapers')}</CardTitle>
            <CardDescription>Analyze patterns with previous year question papers. (Data from Firestore)</CardDescription>
          </CardHeader>
          <CardContent>
            {previousPapers.length > 0 ? (
               <ul className="space-y-3">
                {previousPapers.map((paper) => (
                  <li key={paper.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-secondary-foreground">{paper.name}</p>
                      <p className="text-sm text-muted-foreground">{t('year') || 'Year'}: {paper.year}</p>
                      {paper.fileName && <p className="text-xs text-muted-foreground">File: {paper.fileName}</p>}
                    </div>
                    <Button variant="outline" size="sm" disabled><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('noRegistrations')}</p>}
          </CardContent>
        </Card>
      </div>
       <p className="text-center text-sm text-muted-foreground">
        {t('localStorageNote').replace('local storage', 'Firebase Firestore')}. PDFs are not actually uploaded or downloadable in this prototype.
      </p>
    </div>
  );
}

