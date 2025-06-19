
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsItem {
  id: string;
  text: string;
}

interface NewsCategory {
  id: string;
  icon: string;
  titleKey: keyof ReturnType<typeof useLanguage>['t'];
  items: NewsItem[];
}

// This component is no longer used as news has moved to a separate page.
// Keeping the structure here as a reference if it's ever needed again, but it's not actively rendered.
const newsData: NewsCategory[] = [
  {
    id: 'sainik-rms',
    icon: "🏫",
    titleKey: "sainikMilitaryRmsNewsTitle",
    items: [
      { id: 's1', text: "AISSEE 2025 काउंसलिंग चॉइस फिलिंग विंडो: 15 जून से 21 जून 2025 तक खुली रहेगी।" },
      { id: 's2', text: "AISSEE 2025 काउंसलिंग राउंड-1 रिजल्ट: 24 जून 2025 को जारी होने की संभावना।" },
    ]
  },
];

export function MainNews() {
  const { t } = useLanguage();

  return (
    <Card className="w-full shadow-lg bg-card border-primary/20 mt-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-primary">{t('mainNewsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* News items would be rendered here if this component was used */}
        <p className="text-center text-muted-foreground">{t('loading')}</p>
      </CardContent>
    </Card>
  );
}
    