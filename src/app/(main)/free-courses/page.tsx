
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import Image from 'next/image';

export default function FreeCoursesPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navFreeCourses')}</CardTitle>
          <CardDescription className="text-lg">{t('freeCoursesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="overflow-hidden rounded-lg shadow-md">
            <Image
              src="https://placehold.co/800x400.png"
              alt={t('navFreeCourses')}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="online learning students"
            />
          </div>
          <p className="text-center text-muted-foreground">
            यह फीचर आपको विभिन्न मुफ्त कोर्स और अध्ययन सामग्री प्रदान करेगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
