
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import {
  FileSignature,
  BookCopy,
  MessageCircle,
  Bot,
  FlaskConical,
  TrendingUp,
  Award,
  Users,
  Mail,
  Library,
  Newspaper,
  Download,
} from 'lucide-react';

const featureGridLinks = [
  { href: '/scholarship', labelKey: 'scholarshipForm', icon: FileSignature },
  { href: '/tests', labelKey: 'aiTest', icon: FlaskConical },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: MessageCircle },
  { href: '/learning-hub?tab=courses', labelKey: 'ourCourses', icon: Library },
  { href: '/learning-hub?tab=live_classes', labelKey: 'liveClasses', icon: BookCopy },
  { href: '/learning-hub?tab=daily_posts', labelKey: 'dailyPosts', icon: Newspaper },
  { href: '/cutoff-checker', labelKey: 'navCutOffChecker', icon: TrendingUp },
  { href: '/chat', labelKey: 'aiChat', icon: Bot },
  { href: '/toppers', labelKey: 'toppers', icon: Award },
  { href: '/our-teachers', labelKey: 'ourTeachers', icon: Users },
  { href: '/learning-hub?tab=downloads', labelKey: 'navDownloads', icon: Download },
  { href: '/contact', labelKey: 'navContact', icon: Mail },
];

export default function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start gap-4">
        <Image src="/logo.png" alt="Goswami Defence Academy Logo" width={60} height={60} className="rounded-full" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground">"{t('heroSubtitle')}"</p>
        </div>
      </div>

      <Card className="w-full shadow-lg bg-card text-card-foreground border-primary/20">
        <CardContent className="p-4 text-center">
             <div className="relative flex h-10 w-full overflow-x-hidden">
                <p className="font-signature text-primary text-xl md:text-2xl animate-marquee whitespace-nowrap">
                   "{t('inspiringQuoteTitle')}"
                </p>
                <p className="absolute top-0 font-signature text-primary text-xl md:text-2xl animate-marquee2 whitespace-nowrap">
                   "{t('inspiringQuoteTitle')}"
                </p>
            </div>
        </CardContent>
      </Card>

      <section>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={link.href} passHref>
              <Card className="bg-card hover:bg-muted/50 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-2 md:p-3 shadow-md rounded-lg border border-border">
                <CardHeader className="flex flex-col items-center justify-center p-1 md:p-2">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                </CardHeader>
                <CardContent className="p-1">
                  <span className="text-xs md:text-sm font-medium leading-tight">{t(link.labelKey as any)}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
