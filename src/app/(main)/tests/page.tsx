
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, ListFilter, Download } from 'lucide-react';

// Placeholder data
const mockTestsData = {
  en: [
    { id: 'mt001', name: "Full Syllabus Mock Test 1", date: "15th July 2024", subject: "All Subjects" },
    { id: 'mt002', name: "Mathematics Sectional Test", date: "20th July 2024", subject: "Mathematics" },
    { id: 'mt003', name: "General Knowledge Quiz", date: "22nd July 2024", subject: "GK" },
  ],
  hi: [
    { id: 'mt001', name: "पूर्ण पाठ्यक्रम मॉक टेस्ट 1", date: "15 जुलाई 2024", subject: "सभी विषय" },
    { id: 'mt002', name: "गणित अनुभागीय टेस्ट", date: "20 जुलाई 2024", subject: "गणित" },
    { id: 'mt003', name: "सामान्य ज्ञान प्रश्नोत्तरी", date: "22 जुलाई 2024", subject: "सामान्य ज्ञान" },
  ]
};

const previousPapersData = {
  en: [
    { id: 'pp001', name: "NDA Previous Year Paper 2023", year: "2023" },
    { id: 'pp002', name: "CDS Previous Year Paper 2023", year: "2023" },
  ],
  hi: [
    { id: 'pp001', name: "एनडीए पिछले वर्ष का पेपर 2023", year: "2023" },
    { id: 'pp002', name: "सीडीएस पिछले वर्ष का पेपर 2023", year: "2023" },
  ]
};

export default function TestsPage() {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Placeholder for upload logic
      alert(`${t('uploadTest')}: ${selectedFile.name}`);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navTests')}</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">{t('uploadTest')}</CardTitle>
          <CardDescription>Upload new mock tests or papers for students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input type="file" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleUpload} disabled={!selectedFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <FileUp className="mr-2 h-4 w-4" /> {t('uploadTest')}
            </Button>
          </div>
          {selectedFile && <p className="text-sm text-muted-foreground">{t('selectFile')}: {selectedFile.name}</p>}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('mockTests')}</CardTitle>
            <CardDescription>Practice with our curated mock tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockTestsData[language].map((test) => (
                <li key={test.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-secondary-foreground">{test.name} ({test.subject})</p>
                    <p className="text-sm text-muted-foreground">{t('date') || 'Date'}: {test.date}</p>
                  </div>
                  <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('previousYearPapers')}</CardTitle>
            <CardDescription>Analyze patterns with previous year question papers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {previousPapersData[language].map((paper) => (
                <li key={paper.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-secondary-foreground">{paper.name}</p>
                    <p className="text-sm text-muted-foreground">{t('year') || 'Year'}: {paper.year}</p>
                  </div>
                  <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> {t('download') || 'Download'}</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
