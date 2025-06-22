
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

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
  const { language } = useLanguage();
  const [currentQuotes, setCurrentQuotes] = useState<string[]>(quotes[language]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentQuotes(quotes[language]);
  }, [language]);
  
  if (!isClient) {
    return <div className="h-10 w-full bg-card rounded-md"></div>;
  }

  return (
    <div className="relative flex h-10 w-full overflow-x-hidden bg-card border border-border rounded-md">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {currentQuotes.map((quote, index) => (
          <span key={`${language}-${index}`} className="mx-12 text-md text-foreground/80">
            "{quote}"
          </span>
        ))}
      </div>
      <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
         {currentQuotes.map((quote, index) => (
          <span key={`${language}-${index}-2`} className="mx-12 text-md text-foreground/80">
            "{quote}"
          </span>
        ))}
      </div>
    </div>
  );
}
