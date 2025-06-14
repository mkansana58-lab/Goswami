
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { 
  ShoppingBag, ClipboardCheck, Gift, History, Newspaper, FileQuestion, ListChecks, BookOpen, Briefcase, Tv2, DownloadCloud, GraduationCap, Home as HomeIcon, Bell
} from 'lucide-react';
import Image from 'next/image';

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
    <div className="space-y-6 md:space-y-8 pb-16 md:pb-8"> {/* Added padding bottom for simulated bottom nav */}
      
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
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.labelKey}`} passHref>
              <Card className="hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-2 md:p-3 shadow-md rounded-lg">
                <CardHeader className="flex flex-col items-center justify-center p-2 md:p-3">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-1 md:mb-2" />
                  <CardTitle className="text-xs md:text-sm font-medium text-foreground">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
                {/* Optional: Add CardContent for description if needed, but image is compact */}
                {/* <CardContent className="flex-grow p-1 md:p-2">
                  <p className="text-xs text-muted-foreground">{t(link.descriptionKey as any) || link.descriptionKey}</p>
                </CardContent> */}
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Simulated Bottom Navigation for larger screens - hidden on small screens where header menu is used */}
      {/* This is just a visual simulation, not a fixed bottom bar */}
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


      {/* Commenting out old sections, can be removed if not needed
      <section className="text-center py-12 bg-card rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <ShieldCheck className="h-24 w-24 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8">
            {t('heroSubtitle')}
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-full">
            <Link href="/scholarship">{t('navScholarship')}</Link>
          </Button>
        </div>
      </section>

      <InspirationalMessages /> 
      */}
    </div>
  );
}
