
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
      <CardContent className="text-center h-28 md:h-32 relative overflow-hidden"> {/* Increased height */}
        <div className="animate-marquee-vertical whitespace-nowrap absolute inset-x-0">
          {currentQuotes.map((quote, index) => (
            <p key={`${language}-${index}-top`} className="text-lg italic text-foreground h-28 md:h-32 flex items-center justify-center leading-tight px-2"> {/* Increased height */}
              "{quote}"
            </p>
          ))}
          {/* Duplicate for seamless scrolling */}
          {currentQuotes.map((quote, index) => (
            <p key={`${language}-${index}-bottom`} className="text-lg italic text-foreground h-28 md:h-32 flex items-center justify-center leading-tight px-2"> {/* Increased height */}
              "{quote}"
            </p>
          ))}
        </div>
      </CardContent>
      <style jsx global>{`
        @keyframes marquee-vertical {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); } /* This should be -50% for a two-set continuous scroll */
        }
        .animate-marquee-vertical {
          /* Each quote visible for 5s, total animation time = quotes.length * 5s */
          animation: marquee-vertical ${currentQuotes.length * 7}s linear infinite; /* Adjusted speed, 7s per quote cycle */
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Card>
  );
}
    
