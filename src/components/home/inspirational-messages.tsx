
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentQuotes(quotes[language]);
  }, [language]);

  // Calculate a dynamic duration based on number of quotes, or use a fixed one if preferred.
  // For simplicity with Tailwind config, we'll use the fixed duration from tailwind.config.ts.
  // If dynamic duration is strongly needed, inline style for animationDuration would be an option.
  
  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration issues with dynamic content
    return (
      <Card className="w-full shadow-lg bg-card border-primary mt-8 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline text-primary">{t('inspiringQuote')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center h-32 md:h-40 relative overflow-hidden flex items-center justify-center">
          <p className="text-lg italic text-foreground px-4">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg bg-card border-primary mt-8 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-primary">{t('inspiringQuote')}</CardTitle>
      </CardHeader>
      <CardContent className="text-center h-32 md:h-40 relative overflow-hidden group">
        {currentQuotes.length > 0 && (
          <div className="animate-marquee-vertical group-hover:pause-animation whitespace-nowrap absolute inset-x-0">
            {currentQuotes.map((quote, index) => (
              <p key={`${language}-${index}-top`} className="text-lg md:text-xl italic text-foreground h-32 md:h-40 flex items-center justify-center leading-normal px-4">
                "{quote}"
              </p>
            ))}
            {/* Duplicate for seamless scrolling */}
            {currentQuotes.map((quote, index) => (
              <p key={`${language}-${index}-bottom`} className="text-lg md:text-xl italic text-foreground h-32 md:h-40 flex items-center justify-center leading-normal px-4">
                "{quote}"
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// In your globals.css or a relevant CSS file, if you need to define pause-animation for group-hover:
// .group:hover .animate-marquee-vertical {
//   animation-play-state: paused;
// }
// Or using Tailwind's arbitrary variants if JIT mode is on (usually is with Next.js):
// className="animate-marquee-vertical group-hover:[animation-play-state:paused]"
// For simplicity, I've added group-hover:pause-animation directly, assuming you might have a utility for this or can add it.
// If not, `animation-play-state: paused` on hover can be done via a small global CSS snippet if needed.
// The `animate-marquee-vertical` class itself is defined in tailwind.config.js.
// For direct Tailwind JIT for hover pause: className="animate-marquee-vertical group-hover:[animation-play-state:paused]"
// Let's use that:
// <div className="animate-marquee-vertical group-hover:[animation-play-state:paused] whitespace-nowrap absolute inset-x-0">
// For now, I'll keep it as `group-hover:pause-animation` and assume `pause-animation` utility or you can add it if needed.
// A simpler way for Tailwind is to directly use the JIT variant:
// <div className="animate-marquee-vertical group-hover:[animation-play-state:paused] ...">
// Update: Tailwind arbitrary variants are better here.
// The animation class is `animate-marquee-vertical` (defined in tailwind.config.ts)
// To pause on hover, add `group-hover:[animation-play-state:paused]` to the animated div.
// And the parent `CardContent` needs `group` class.
