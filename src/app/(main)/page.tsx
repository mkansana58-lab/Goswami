
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import {
  ClipboardCheck, Gift, Newspaper, ListChecks, Home as HomeIcon, PackageSearch, PlaySquare, Tv2, DownloadCloud, Cpu, Library, UserCircle, CalendarDays, School, Mail, BookOpen
} from 'lucide-react';
import Image from 'next/image';
import { InspirationalMessages } from '@/components/home/inspirational-messages';
import React, { useEffect, useState, useCallback } from 'react';
import { STUDENT_LOGGED_IN_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import { usePathname } from 'next/navigation';

const featureGridLinks = [
  { href: '/learning-hub', labelKey: 'navLearningHub', icon: Library },
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu },
  { href: '/sainik-e-counselling', labelKey: 'navSainikECounselling', icon: School },
  { href: '/current-affairs', labelKey: 'navCurrentAffairs', icon: Newspaper },
  { href: '/study-books', labelKey: 'navStudyBooks', icon: BookOpen },
  { href: '/student-profile', labelKey: 'studentProfileTitle', icon: UserCircle },
  { href: '/contact', labelKey: 'navContact', icon: Mail },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  
  const updateLoginState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      if (loggedIn) {
        const profileRaw = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
        if (profileRaw) {
          try {
            const profile = JSON.parse(profileRaw);
            setStudentName(profile.name || null);
          } catch (e) { console.error("Error parsing student profile on homepage:", e); setStudentName(null); }
        } else {
          setStudentName(null);
        }
      } else {
        setStudentName(null);
      }
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    updateLoginState();

    window.addEventListener('studentProfileUpdated', updateLoginState);
    window.addEventListener('studentLoggedOut', updateLoginState);
    
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STUDENT_LOGGED_IN_KEY || event.key === STUDENT_PROFILE_LOCALSTORAGE_KEY) {
        updateLoginState();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('studentProfileUpdated', updateLoginState);
      window.removeEventListener('studentLoggedOut', updateLoginState);
      window.removeEventListener('storage', handleStorage);
    };
  }, [updateLoginState]);


  return (
    <div className="space-y-6 md:space-y-8 bg-background">
      <section className="text-left py-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {isClient && studentName ? `${t('greetingDynamic')} ${studentName}!` : t('helloTeam')}
        </h2>
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-lg group">
          <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full">
            <Image
              src="https://placehold.co/1200x300.png" 
              alt={t('scholarshipExamsBanner')}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="military students parade" 
              priority
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-center text-primary mb-4">{t('mainFeatures') || "मुख्य विशेषताएं"}</h3>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.labelKey}`} passHref>
              <Card className="bg-card hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-2 md:p-3 shadow-md rounded-lg border border-muted">
                <CardHeader className="flex flex-col items-center justify-center p-1 md:p-2">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-1" />
                  <CardTitle className="text-[11px] md:text-sm font-medium text-foreground leading-tight">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <InspirationalMessages />

    </div>
  );
}
