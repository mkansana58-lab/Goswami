
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import {
  ClipboardCheck, Cpu, Newspaper, ListChecks, School, Library, BookOpen, Briefcase, Mail
} from 'lucide-react';
import Image from 'next/image';
import { InspirationalMessages } from '@/components/home/inspirational-messages';
import React from 'react';

const featureGridLinks = [
  { href: '/learning-hub', labelKey: 'navLearningHub', icon: Library },
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu },
  { href: '/current-affairs', labelKey: 'navCurrentAffairs', icon: Newspaper },
  { href: '/syllabus', labelKey: 'navSyllabus', icon: ListChecks },
  { href: '/study-books', labelKey: 'navStudyBooks', icon: BookOpen },
  { href: '/job-alerts', labelKey: 'navJobAlerts', icon: Briefcase },
  { href: '/sainik-e-counselling', labelKey: 'navSainikECounselling', icon: School },
  { href: '/contact', labelKey: 'navContact', icon: Mail },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 md:space-y-8 bg-background">
      <section className="text-left py-4">
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-lg group">
          <div className="relative h-[150px] sm:h-[200px] md:h-[250px] w-full">
            <Image
              src="https://placehold.co/1200x250.png" 
              alt={t('scholarshipExamsBanner')}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="scholarship exams app" 
              priority
            />
          </div>
        </div>
      </section>
      
      <InspirationalMessages />

      <section>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.labelKey}`} passHref>
              <Card className="bg-card hover:bg-muted transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-2 md:p-3 shadow-md rounded-lg border border-border">
                <CardHeader className="flex flex-col items-center justify-center p-1 md:p-2">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                  <CardTitle className="text-[11px] md:text-sm font-medium text-foreground leading-tight">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
