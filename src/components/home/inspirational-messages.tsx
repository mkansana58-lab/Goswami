
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Button } from '../ui/button';

const quotes = {
  en: [
    "The best way to predict the future is to create it.",
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "The only limit to our realization of tomorrow will be our doubts of today."
  ],
  hi: [
    "भविष्य की भविष्यवाणी करने का सबसे अच्छा तरीका इसे बनाना है।",
    "विश्वास करो कि तुम कर सकते हो और तुम आधे रास्ते पर हो।",
    "सफलता अंतिम नहीं है, असफलता घातक नहीं है: यह जारी रखने का साहस है जो मायने रखता है।",
    "कठिनाइयाँ अक्सर साधारण लोगों को असाधारण भाग्य के लिए तैयार करती हैं।",
    "कल की हमारी प्राप्ति की एकमात्र सीमा आज के हमारे संदेह होंगे।"
  ]
};

export function InspirationalMessages() {
  const { language, t } = useLanguage();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes[language].length);
    }, 7000); // Change quote every 7 seconds
    return () => clearInterval(timer);
  }, [language]);

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes[language].length);
  };

  const handlePrevQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex - 1 + quotes[language].length) % quotes[language].length);
  };

  return (
    <Card className="w-full shadow-lg bg-card border-primary mt-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-primary">{t('inspiringQuote')}</CardTitle>
      </CardHeader>
      <CardContent className="text-center min-h-[100px] flex flex-col items-center justify-center">
        <p className="text-lg italic text-foreground">
          "{quotes[language][currentQuoteIndex]}"
        </p>
        <div className="mt-4 flex justify-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevQuote} aria-label="Previous quote">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextQuote} aria-label="Next quote">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
