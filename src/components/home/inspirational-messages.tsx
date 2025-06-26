
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';


const quotes = {
  en: [
    "Your struggle is the determinant of your success.",
  ],
  hi: [
    "आपके संघर्ष की ताकत ही आपकी उपलब्धि की सफलता को निर्धारित करती है।",
  ]
};

export function InspirationalMessages() {
  const { language } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState<string>(quotes[language][0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentQuote(quotes[language][0]);
  }, [language]);
  
  if (!isClient) {
    return <div className="h-24 w-full bg-card rounded-md shadow-lg"></div>;
  }

  return (
    <Card className="w-full shadow-lg bg-card border-primary/20">
        <CardContent className="p-4">
             <div className="relative flex h-10 w-full overflow-x-hidden">
                <p className="font-signature text-primary text-xl md:text-2xl animate-marquee whitespace-nowrap">
                   "{currentQuote}"
                </p>
                <p className="absolute top-0 font-signature text-primary text-xl md:text-2xl animate-marquee2 whitespace-nowrap">
                   "{currentQuote}"
                </p>
            </div>
        </CardContent>
    </Card>
  );
}
