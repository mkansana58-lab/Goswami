
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { 
  ShoppingBag, ClipboardCheck, Gift, History, Newspaper, FileQuestion, ListChecks, BookOpen, Briefcase, Tv2, DownloadCloud, GraduationCap, Home as HomeIcon, Bell
} from 'lucide-react';
import Image from 'next/image';

// Corresponds to the 9 items in the image grid
const featureGridLinks = [
  { href: '/premium-courses', labelKey: 'paidCourses', icon: ShoppingBag, descriptionKey: 'premiumCoursesDesc' },
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck, descriptionKey: 'navTests' },
  { href: '/free-courses', labelKey: 'freeCourses', icon: Gift, descriptionKey: 'navFreeCourses' },
  { href: '/tests', labelKey: 'previousPapersNav', icon: History, descriptionKey: 'previousYearPapers' },
  { href: '/current-affairs', labelKey: 'currentAffairs', icon: Newspaper, descriptionKey: 'navCurrentAffairs' },
  { href: '/quiz', labelKey: 'navQuiz', icon: FileQuestion, descriptionKey: 'quizDesc' },
  { href: '/syllabus', labelKey: 'navSyllabus', icon: ListChecks, descriptionKey: 'syllabusDesc' },
  { href: '/study-books', labelKey: 'navStudyBooks', icon: BookOpen, descriptionKey: 'studyBooksDesc' },
  { href: '/job-alerts', labelKey: 'navJobAlerts', icon: Briefcase, descriptionKey: 'jobAlertsDesc' },
];

// These match the bottom nav in the image, and are primary items in header.tsx
const bottomNavSimulatedLinks = [
    { href: '/', labelKey: 'navHome', icon: HomeIcon, descriptionKey: 'navHome' },
    { href: '/my-course', labelKey: 'navMyCourse', icon: GraduationCap, descriptionKey: 'myCourseDesc' },
    { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2, descriptionKey: 'liveClassesDesc' },
    { href: '/downloads', labelKey: 'navDownloads', icon: DownloadCloud, descriptionKey: 'downloadsDesc' },
];


export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 md:space-y-8 pb-16 md:pb-8">
      
      <section className="text-left py-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t('helloTeam')}
        </h2>
        <Card className="overflow-hidden shadow-lg rounded-lg border-none">
          <Image 
            src="https://placehold.co/1200x350.png" 
            alt={t('placeholderBanner')}
            width={1200} 
            height={350} 
            className="w-full h-auto object-cover"
            data-ai-hint="course promotion offer" 
          />
        </Card>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.labelKey}`} passHref>
              <Card className="hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-2 md:p-3 shadow-md rounded-lg">
                <CardHeader className="flex flex-col items-center justify-center p-2 md:p-3">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-1 md:mb-2" />
                  <CardTitle className="text-xs md:text-sm font-medium text-foreground">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="hidden md:block pt-8">
        <h3 className="text-lg font-semibold text-center text-primary mb-4">{t('exploreSections')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bottomNavSimulatedLinks.map((link) => (
                 <Link href={link.href} key={link.href+"-bottom"} passHref>
                    <Card className="hover:shadow-lg hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-4 rounded-lg">
                        <link.icon className="h-10 w-10 text-accent mb-2" />
                        <CardTitle className="text-md font-semibold text-primary">{t(link.labelKey as any)}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{t(link.descriptionKey as any)}</p>
                    </Card>
                 </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
