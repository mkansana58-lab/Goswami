
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpingHand, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChanceCheckingPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center">
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <HelpingHand className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navChanceChecking')}</CardTitle>
          <CardDescription className="text-lg">{t('chanceCheckingDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            {t('chanceCheckingInfo') || "Our Cut-Off Checker tool uses advanced AI to analyze your exam scores and provide an assessment of your selection chances. It also offers personalized advice to help you improve."}
          </p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/cutoff-checker">
              {t('goToCutoffChecker') || 'Go to Cut-Off Checker'} <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
           <p className="text-muted-foreground text-sm mt-4">
            {t('chanceCheckingNote') || "This tool provides an estimate based on the data you provide and general patterns. Actual selection depends on various factors."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Add to translations:
// chanceCheckingInfo: "Our Cut-Off Checker tool uses advanced AI to analyze your exam scores and provide an assessment of your selection chances. It also offers personalized advice to help you improve." (EN/HI)
// goToCutoffChecker: "Go to Cut-Off Checker" (EN/HI)
// chanceCheckingNote: "This tool provides an estimate based on the data you provide and general patterns. Actual selection depends on various factors." (EN/HI)
