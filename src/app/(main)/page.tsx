"use client";

import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  ClipboardPen,
  Ticket,
  BookOpenCheck,
  RadioTower,
  Newspaper,
  CheckSquare,
  GraduationCap,
  MessageSquare,
  ScrollText,
  Scissors,
  Trophy,
  CircleDot
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function HomePage() {
  const { t } = useLanguage();

  const featureGridLinks = [
    { href: "/scholarship", icon: ClipboardPen, textKey: "scholarshipForm" },
    { href: "/admit-card", icon: Ticket, textKey: "admitCard" },
    { href: "/courses", icon: BookOpenCheck, textKey: "ourCourses" },
    { href: "/live-classes", icon: RadioTower, textKey: "liveClasses" },
    { href: "/daily-posts", icon: Newspaper, textKey: "dailyPosts" },
    { href: "/tests", icon: CheckSquare, textKey: "aiTest" },
    { href: "/ai-tutor", icon: GraduationCap, textKey: "aiTutor" },
    { href: "/ai-chat", icon: MessageSquare, textKey: "aiChat" },
    { href: "/current-affairs", icon: ScrollText, textKey: "currentAffairs" },
    { href: "/cutoff-checker", icon: Scissors, textKey: "cutoffChecker" },
    { href: "/toppers", icon: Trophy, textKey: "toppers" },
    { href: "/contact", icon: CircleDot, textKey: "contactUs" },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold text-primary-foreground">{t('appName')}</h1>
      </div>

      <Card className="w-full max-w-2xl mb-8 bg-card border-primary/20 shadow-lg rounded-xl">
        <CardContent className="p-4">
          <p className="text-lg font-signature text-primary">
            "{t('quote')}"
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
        {featureGridLinks.map((link) => (
          <Link href={link.href} key={link.href} passHref>
            <Card className="bg-card hover:bg-accent transition-colors duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-2 md:p-3 aspect-square shadow-md rounded-xl border border-border/10">
              <link.icon className="h-7 w-7 md:h-8 md:w-8 text-primary mb-2" />
              <p className="text-xs md:text-sm font-medium text-primary-foreground/80">{t(link.textKey as any)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
