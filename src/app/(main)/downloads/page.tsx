
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DownloadCloud, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const downloadableItems = [
  { id: 'dl001', nameKey: 'syllabusDesc', fileName: 'syllabus_all_courses.pdf', icon: FileText },
  { id: 'dl002', nameKey: 'premiumSainikPrice', fileName: 'sainik_school_brochure.pdf', icon: FileText },
  { id: 'dl003', nameKey: 'navTests', fileName: 'sample_mock_test.pdf', icon: FileText },
];

export default function DownloadsPage() {
  const { t } = useLanguage();

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
        <CardContent className="space-y-4">
          {downloadableItems.map((item) => (
            <Card key={item.id} className="p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <item.icon className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-secondary-foreground">{t(item.nameKey as any)}</p>
                  <p className="text-sm text-muted-foreground">{item.fileName}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <DownloadCloud className="mr-2 h-4 w-4" /> {t('download')}
              </Button>
            </Card>
          ))}
           <p className="text-center text-sm text-muted-foreground pt-4">
            {/* Add specific content for Downloads page here */}
            यहाँ आपको डाउनलोड करने योग्य सामग्री मिलेगी। अभी यह निर्माणाधीन है। (नोट: डाउनलोड बटन अभी काम नहीं करेंगे)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
