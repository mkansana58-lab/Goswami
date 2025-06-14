
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const materials = [
  { id: 'sm001', name: 'गणित के नोट्स', subject: 'गणित', type: 'PDF', icon: FileText },
  { id: 'sm002', name: 'इतिहास महत्वपूर्ण तिथियाँ', subject: 'सामान्य ज्ञान', type: 'Document', icon: FileText },
  { id: 'sm003', name: 'अंग्रेजी व्याकरण नियम', subject: 'अंग्रेजी', type: 'eBook', icon: BookOpen },
];

export default function StudyMaterialPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navStudyMaterial')}</CardTitle>
          <CardDescription className="text-lg">{t('studyMaterialDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {materials.map((material) => (
            <Card key={material.id} className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <material.icon className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-secondary-foreground">{material.name} ({material.subject})</p>
                  <p className="text-sm text-muted-foreground">{t('fileType') || 'Type'}: {material.type}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">{t('download')}</Button>
            </Card>
          ))}
          <p className="text-center text-sm text-muted-foreground pt-4">
            यह पेज आपको क्यूरेटेड अध्ययन सामग्री और नोट्स प्रदान करेगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add 'fileType' to translations if needed, or manage directly in component if simple.
// For now, assuming t('download') already exists.
