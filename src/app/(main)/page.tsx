
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import {
  ClipboardCheck, Cpu, Newspaper, ListChecks, School, Library, BookOpen, Briefcase, Mail, FileSignature, BookUser, Radio, Tv, FileDown, Trophy, MessageCircle, BarChart, PenSquare
} from 'lucide-react';
import { InspirationalMessages } from '@/components/home/inspirational-messages';
import React from 'react';

const featureGridLinks = [
  { href: '/scholarship', labelKey: 'scholarshipForm', icon: FileSignature },
  { href: '/scholarship?tab=admit-card', labelKey: 'admitCard', icon: BookUser },
  { href: '/learning-hub', labelKey: 'ourCourses', icon: Library },
  { href: '/learning-hub?tab=live-classes', labelKey: 'liveClasses', icon: Radio },
  { href: '/learning-hub?tab=daily-posts', labelKey: 'dailyPosts', icon: PenSquare },
  { href: '/tests', labelKey: 'aiTest', icon: ClipboardCheck },
  { href: '/ai-tutor', labelKey: 'aiTutor', icon: Cpu },
  { href: '/chat', labelKey: 'aiChat', icon: MessageCircle },
  { href: '/current-affairs', labelKey: 'currentAffairs', icon: Newspaper },
  { href: '/cutoff-checker', labelKey: 'cutOffChecker', icon: BarChart },
  { href: '/tests', labelKey: 'toppers', icon: Trophy },
  { href: '/contact', labelKey: 'contactUs', icon: Mail },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 md:space-y-8 bg-background">
      
      <InspirationalMessages />

      <section>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={link.href} passHref>
              <Card className="bg-card hover:bg-muted/50 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-2 md:p-3 shadow-md rounded-lg border border-border">
                <CardHeader className="flex flex-col items-center justify-center p-1 md:p-2">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                  <CardTitle className="text-xs md:text-sm font-medium text-foreground leading-tight">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
