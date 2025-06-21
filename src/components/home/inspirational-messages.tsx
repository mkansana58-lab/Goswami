
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [currentQuotes, setCurrentQuotes] = useState<string[]>(quotes[language]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentQuotes(quotes[language]);
  }, [language]);
  
  if (!isClient) {
    return (
      <Card className="w-full shadow-lg bg-card border-primary mt-8 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center text-xl font-headline text-primary">{t('inspiringQuote')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center h-32 md:h-40 relative flex items-center justify-center">
          <p className="text-lg italic text-foreground px-4">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg bg-red-600 text-white mt-8 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center text-xl font-headline text-white">{t('inspiringQuoteTitle') || "रक्षकों की एक पीढ़ी को प्रेरित करना"}</CardTitle>
      </CardHeader>
      <CardContent className="text-center h-40 md:h-48 relative overflow-hidden group">
        {currentQuotes.length > 0 && (
          <div className="animate-marquee-vertical group-hover:[animation-play-state:paused] whitespace-normal absolute inset-x-0">
            {currentQuotes.map((quote, index) => (
              <p key={`${language}-${index}-top`} className="text-xl md:text-2xl italic h-40 md:h-48 flex items-center justify-center leading-relaxed px-6">
                "{quote}"
              </p>
            ))}
            {/* Duplicate for seamless scrolling */}
            {currentQuotes.map((quote, index) => (
              <p key={`${language}-${index}-bottom`} className="text-xl md:text-2xl italic h-40 md:h-48 flex items-center justify-center leading-relaxed px-6">
                "{quote}"
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
