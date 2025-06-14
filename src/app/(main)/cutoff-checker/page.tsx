
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScissorsLineDashed } from 'lucide-react';
import Image from 'next/image';

export default function CutOffCheckerPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <ScissorsLineDashed className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navCutOffChecker')}</CardTitle>
          <CardDescription className="text-lg">{t('cutOffCheckerDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-lg shadow-md">
            <Image
              src="https://placehold.co/800x400.png"
              alt={t('navCutOffChecker')}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="graph statistics"
            />
          </div>
          <p className="text-center text-muted-foreground">
            यह फीचर आपको पिछले वर्षों के कट-ऑफ अंक देखने में मदद करेगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
