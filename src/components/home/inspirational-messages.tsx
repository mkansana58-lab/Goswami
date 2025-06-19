
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { language, t } = useLanguage();
  const [currentQuotes, setCurrentQuotes] = useState<string[]>(quotes[language]);

  useEffect(() => {
    setCurrentQuotes(quotes[language]);
  }, [language]);

  return (
    <Card className="w-full shadow-lg bg-card border-primary mt-8 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-primary">{t('inspiringQuote')}</CardTitle>
      </CardHeader>
      <CardContent className="text-center h-32 md:h-40 relative overflow-hidden"> {/* Increased height */}
        <div className="animate-marquee-vertical whitespace-nowrap absolute inset-x-0">
          {currentQuotes.map((quote, index) => (
            <p key={`${language}-${index}-top`} className="text-xl italic text-foreground h-32 md:h-40 flex items-center justify-center leading-normal px-4"> {/* Increased height, font size, leading, and padding */}
              "{quote}"
            </p>
          ))}
          {/* Duplicate for seamless scrolling */}
          {currentQuotes.map((quote, index) => (
            <p key={`${language}-${index}-bottom`} className="text-xl italic text-foreground h-32 md:h-40 flex items-center justify-center leading-normal px-4"> {/* Increased height, font size, leading, and padding */}
              "{quote}"
            </p>
          ))}
        </div>
      </CardContent>
      <style jsx global>{`
        @keyframes marquee-vertical {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); } 
        }
        .animate-marquee-vertical {
          animation: marquee-vertical ${currentQuotes.length * 8}s linear infinite; /* Adjusted speed, e.g., 8s per quote cycle */
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Card>
  );
}
    
