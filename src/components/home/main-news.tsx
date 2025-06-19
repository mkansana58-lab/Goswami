
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

const newsData: NewsCategory[] = [
  {
    id: 'sainik-rms',
    icon: "🏫",
    titleKey: "sainikMilitaryRmsNewsTitle",
    items: [
      { id: 's1', text: "AISSEE 2025 काउंसलिंग चॉइस फिलिंग विंडो: 15 जून से 21 जून 2025 तक खुली रहेगी।" },
      { id: 's2', text: "AISSEE 2025 काउंसलिंग राउंड-1 रिजल्ट: 24 जून 2025 को जारी होने की संभावना।" },
      { id: 's3', text: "RMS एडमिशन 2025 नोटिफिकेशन: जुलाई के पहले सप्ताह में जारी हो सकता है।" },
      { id: 's4', text: "नए सैनिक स्कूलों में सीटें बढ़ाई गईं: 2025 सत्र से 10 नए सैनिक स्कूलों में सीटों में 20% बढ़ोतरी।" },
      { id: 's5', text: "RMS इंटरव्यू राउंड की तैयारी टिप्स और गाइडलाइन जारी।" },
    ]
  },
  {
    id: 'jnv',
    icon: "🎓",
    titleKey: "jnvNewsTitle",
    items: [
      { id: 'j1', text: "JNVST कक्षा 6 परिणाम 2025: 20 जून 2025 तक घोषित होने की उम्मीद।" },
      { id: 'j2', text: "JNVST कक्षा 9 एडमिशन प्रक्रिया: जुलाई के पहले सप्ताह से शुरू होगी।" },
      { id: 'j3', text: "JNV स्कूलों में NVS द्वारा कोडिंग क्लासेस की शुरुआत: 2025-26 सत्र से।" },
    ]
  },
  {
    id: 'neet-medical',
    icon: "🧪",
    titleKey: "neetMedicalNewsTitle",
    items: [
      { id: 'n1', text: "NEET UG 2025 Answer Key: ऑफिशियल वेबसाइट पर 18 जून तक जारी हो सकती है।" },
      { id: 'n2', text: "NEET UG 2025 Result Date: 30 जून 2025 को संभावित।" },
      { id: 'n3', text: "NEET PG 2025 परीक्षा तिथि: 11 अगस्त 2025 घोषित की गई है।" },
    ]
  },
  {
    id: 'ssc-govt',
    icon: "✍️",
    titleKey: "sscGovtJobsNewsTitle",
    items: [
      { id: 'sc1', text: "SSC CHSL 2024 Tier-1 Admit Card: 20 जून 2025 से डाउनलोड शुरू।" },
      { id: 'sc2', text: "SSC GD 2024 फाइनल रिजल्ट: 25 जून 2025 को घोषित होने की संभावना।" },
      { id: 'sc3', text: "SSC CGL 2025 Notification: जुलाई 2025 के पहले हफ्ते में संभावित।" },
    ]
  },
  {
    id: 'railway-rrb',
    icon: "🚆",
    titleKey: "railwayRrbNewsTitle",
    items: [
      { id: 'r1', text: "RRB ALP 2024 आवेदन सुधार विंडो: 18 से 22 जून 2025 तक खुली।" },
      { id: 'r2', text: "RRB NTPC 2025 Notification: सितंबर में संभावित है, तैयारी अभी से शुरू करें।" },
    ]
  },
  {
    id: 'cuet-nda-upsc',
    icon: "🏛️",
    titleKey: "cuetNdaUpscNewsTitle",
    items: [
      { id: 'c1', text: "CUET UG 2025 Answer Key: जून 2025 के अंत तक जारी होगी।" },
      { id: 'c2', text: "CUET UG 2025 Result: जुलाई के पहले सप्ताह में।" },
      { id: 'c3', text: "NDA 2 2025 Application Form: 15 मई से शुरू, अंतिम तिथि 4 जून थी।" },
      { id: 'c4', text: "UPSC Prelims 2025 Answer Key (Unofficial): बड़ी कोचिंग संस्थाओं द्वारा जारी।" },
    ]
  }
];

export function MainNews() {
  const { t } = useLanguage();

  return (
    <Card className="w-full shadow-lg bg-card border-primary/20 mt-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-primary">{t('mainNewsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {newsData.map((category) => (
          <div key={category.id}>
            <h3 className="text-xl font-semibold text-secondary-foreground mb-2 flex items-center">
              <span className="text-2xl mr-2">{category.icon}</span>
              {t(category.titleKey)}
            </h3>
            <ul className="list-decimal list-inside space-y-1 pl-4">
              {category.items.map((item) => (
                <li key={item.id} className="text-sm text-foreground">
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

    