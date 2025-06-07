
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TestItem {
  id: string;
  name: string;
  date: string;
  subject: string;
}

interface PaperItem {
  id: string;
  name: string;
  year: string;
}

const initialMockTestsData = {
  en: [
    { id: 'h_mt001', name: "Full Syllabus Mock Test 1", date: "15th July 2024", subject: "All Subjects" },
    { id: 'h_mt002', name: "Mathematics Sectional Test", date: "20th July 2024", subject: "Mathematics" },
    { id: 'h_mt003', name: "General Knowledge Quiz", date: "22nd July 2024", subject: "GK" },
  ],
  hi: [
    { id: 'h_mt001', name: "पूर्ण पाठ्यक्रम मॉक टेस्ट 1", date: "15 जुलाई 2024", subject: "सभी विषय" },
    { id: 'h_mt002', name: "गणित अनुभागीय टेस्ट", date: "20 जुलाई 2024", subject: "गणित" },
    { id: 'h_mt003', name: "सामान्य ज्ञान प्रश्नोत्तरी", date: "22 जुलाई 2024", subject: "सामान्य ज्ञान" },
  ]
};

const initialPreviousPapersData = {
  en: [
    { id: 'h_pp001', name: "NDA Previous Year Paper 2023", year: "2023" },
    { id: 'h_pp002', name: "CDS Previous Year Paper 2023", year: "2023" },
  ],
  hi: [
    { id: 'h_pp001', name: "एनडीए पिछले वर्ष का पेपर 2023", year: "2023" },
    { id: 'h_pp002', name: "सीडीएस पिछले वर्ष का पेपर 2023", year: "2023" },
  ]
};

const USER_MOCK_TESTS_STORAGE_KEY = 'userAddedMockTests';
const USER_PREVIOUS_PAPERS_STORAGE_KEY = 'userAddedPreviousPapers';
const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export default function TestsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [mockTests, setMockTests] = useState<TestItem[]>([]);
  const [previousPapers, setPreviousPapers] = useState<PaperItem[]>([]);
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShowAdminFeatures(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserMockTestsString = localStorage.getItem(USER_MOCK_TESTS_STORAGE_KEY);
      let userMockTests: TestItem[] = [];
      if (storedUserMockTestsString) {
        try {
          userMockTests = JSON.parse(storedUserMockTestsString);
        } catch (e) {
          console.error("Error parsing user mock tests from localStorage", e);
        }
      }
      const currentLangInitialMockTests = initialMockTestsData[language] || [];
      setMockTests([...currentLangInitialMockTests, ...userMockTests]);

      const storedUserPreviousPapersString = localStorage.getItem(USER_PREVIOUS_PAPERS_STORAGE_KEY);
      let userPreviousPapers: PaperItem[] = [];
      if (storedUserPreviousPapersString) {
        try {
          userPreviousPapers = JSON.parse(storedUserPreviousPapersString);
        } catch (e) {
          console.error("Error parsing user previous papers from localStorage", e);
        }
      }
      const currentLangInitialPreviousPapers = initialPreviousPapersData[language] || [];
      setPreviousPapers([...currentLangInitialPreviousPapers, ...userPreviousPapers]);
    }
  }, [language, isClient]);

  const saveToLocalStorage = (data: any[], key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && showAdminFeatures) {
      const newTest: TestItem = {
        id: `user_mt_${Date.now()}`,
        name: selectedFile.name,
        date: new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
        subject: t('subject') || "Uploaded", 
      };

      const storedUserMockTestsString = localStorage.getItem(USER_MOCK_TESTS_STORAGE_KEY);
      let userMockTests: TestItem[] = [];
      if (storedUserMockTestsString) {
        try {
          userMockTests = JSON.parse(storedUserMockTestsString);
        } catch (e) { console.error("Error parsing user mock tests from localStorage", e); }
      }
      
      const updatedUserMockTests = [...userMockTests, newTest];
      saveToLocalStorage(updatedUserMockTests, USER_MOCK_TESTS_STORAGE_KEY);
      
      const currentLangInitialMockTests = initialMockTestsData[language] || [];
      setMockTests([...currentLangInitialMockTests, ...updatedUserMockTests]);
      
      toast({
        title: t('uploadTest') + " " + (t('registrationSuccess') || "Successful!"),
        description: `${selectedFile.name} ${t('liveClassAddedSuccess') || 'added successfully.'}`,
      });
      setSelectedFile(null); 
      if (event.target && typeof (event.target as HTMLInputElement).value !== 'undefined') {
        (event.target as HTMLInputElement).value = ""; 
      }
    }
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>{t('loading')}</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navTests')}</h1>

      {showAdminFeatures && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('uploadTest')}</CardTitle>
            <CardDescription>{t('adminUploadOnly')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                id="test-file-upload"
                type="file" 
                onChange={handleFileChange} 
                className="max-w-sm border-input focus:ring-primary" 
                aria-label={t('selectFile')}
              />
              <Button onClick={handleUpload} disabled={!selectedFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <FileUp className="mr-2 h-4 w-4" /> {t('uploadTest')}
              </Button>
            </div>
            {selectedFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {selectedFile.name}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('mockTests')}</CardTitle>
            <CardDescription>Practice with our curated mock tests.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockTests.length > 0 ? (
              <ul className="space-y-3">
                {mockTests.map((test) => (
                  <li key={test.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-secondary-foreground">{test.name} ({test.subject})</p>
                      <p className="text-sm text-muted-foreground">{t('date') || 'Date'}: {test.date}</p>
                    </div>
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('noRegistrations')}</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('previousYearPapers')}</CardTitle>
            <CardDescription>Analyze patterns with previous year question papers.</CardDescription>
          </CardHeader>
          <CardContent>
            {previousPapers.length > 0 ? (
               <ul className="space-y-3">
                {previousPapers.map((paper) => (
                  <li key={paper.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-secondary-foreground">{paper.name}</p>
                      <p className="text-sm text-muted-foreground">{t('year') || 'Year'}: {paper.year}</p>
                    </div>
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('noRegistrations')}</p>}
          </CardContent>
        </Card>
      </div>
       <p className="text-center text-sm text-muted-foreground">
        Note: Test data you add is stored in your browser's local storage. PDFs are not actually uploaded or downloadable in this prototype.
      </p>
    </div>
  );
}
