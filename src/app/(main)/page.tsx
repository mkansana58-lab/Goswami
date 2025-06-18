
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { 
  ShoppingBag, ClipboardCheck, Gift, History, Newspaper, FileQuestion, ListChecks, BookOpen, Briefcase, GraduationCap, Home as HomeIcon, Bell, CalendarDays, Library, UserCircle, PackageSearch
} from 'lucide-react';
import Image from 'next/image';
import { InspirationalMessages } from '@/components/home/inspirational-messages';
import { useEffect, useState } from 'react';
import { STUDENT_LOGGED_IN_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';


const featureGridLinks = [
  { href: '/study-material', labelKey: 'paidCourses', icon: ShoppingBag, descriptionKey: 'premiumCoursesDesc' }, 
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck, descriptionKey: 'navTests' },
  { href: '/study-material', labelKey: 'freeCourses', icon: Gift, descriptionKey: 'freeCoursesDesc' }, 
  { href: '/tests', labelKey: 'previousPapersNav', icon: History, descriptionKey: 'previousYearPapers' }, 
  { href: '/current-affairs', labelKey: 'currentAffairs', icon: Newspaper, descriptionKey: 'navCurrentAffairs' },
  { href: '/quiz', labelKey: 'navQuiz', icon: FileQuestion, descriptionKey: 'quizDesc' },
  { href: '/syllabus', labelKey: 'navSyllabus', icon: ListChecks, descriptionKey: 'syllabusDesc' },
  { href: '/study-books', labelKey: 'ourBooks', icon: BookOpen, descriptionKey: 'studyBooksDesc' }, 
  { href: '/job-alerts', labelKey: 'navJobAlerts', icon: Briefcase, descriptionKey: 'jobAlertsDesc' },
  { href: '/study-material', labelKey: 'navStudyMaterial', icon: Library, descriptionKey: 'studyMaterialHubDesc' }, 
];

const getBottomNavSimulatedLinks = (isStudentLoggedIn: boolean) => [
    { href: '/', labelKey: 'navHome', icon: HomeIcon, descriptionKey: 'navHome' },
    ...(isStudentLoggedIn ? [{ href: '/student-profile', labelKey: 'studentProfileTitle', icon: UserCircle, descriptionKey: 'studentProfileTitle' }] : []),
    { href: '/learning-hub', labelKey: 'navLearningHub', icon: PackageSearch, descriptionKey: 'learningHubDesc' },
    { href: '/schedule', labelKey: 'navSchedule', icon: CalendarDays, descriptionKey: 'navSchedule' },
];


export default function HomePage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);

  const updateLoginState = () => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      setIsStudentLoggedIn(loggedIn);
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
  };

  useEffect(() => {
    setIsClient(true);
    updateLoginState(); // Initial check

    window.addEventListener('studentProfileUpdated', updateLoginState);
    window.addEventListener('studentLoggedOut', updateLoginState);

    return () => {
      window.removeEventListener('studentProfileUpdated', updateLoginState);
      window.removeEventListener('studentLoggedOut', updateLoginState);
    };
  }, []);

  const bottomNavSimulatedLinks = getBottomNavSimulatedLinks(isStudentLoggedIn);

  return (
    <div className="space-y-6 md:space-y-8 pb-16 md:pb-8 bg-background">
      <section className="text-left py-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {isClient && isStudentLoggedIn && studentName ? `${t('greetingDynamic')} ${studentName}!` : t('helloTeam')}
        </h2>
        <Card className="overflow-hidden shadow-lg rounded-lg border-none">
          <Image 
            src="https://placehold.co/1200x400.png" 
            alt={t('placeholderBanner')}
            width={1200} 
            height={400} 
            className="w-full h-auto object-cover"
            data-ai-hint="course promotion exam foundation" 
          />
        </Card>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.labelKey}`} passHref>
              <Card className="bg-card hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-2 md:p-3 shadow-md rounded-lg border border-muted">
                <CardHeader className="flex flex-col items-center justify-center p-2 md:p-3">
                  <link.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-1 md:mb-2" />
                  <CardTitle className="text-xs md:text-sm font-medium text-foreground">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <InspirationalMessages />

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border shadow-top p-2 z-40">
        <div className="container mx-auto flex justify-around items-center h-14">
          {bottomNavSimulatedLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-mobile-bottom`} passHref>
              <div className="flex flex-col items-center justify-center text-center cursor-pointer group">
                <link.icon className="h-6 w-6 mb-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{t(link.labelKey as any)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <section className="hidden md:block pt-8">
        <h3 className="text-lg font-semibold text-center text-primary mb-4">{t('exploreSections')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bottomNavSimulatedLinks.map((link) => (
                 <Link href={link.href} key={`${link.href}-desktop-bottom`} passHref>
                    <Card className="bg-card hover:shadow-lg hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center p-4 rounded-lg border border-muted">
                        <link.icon className="h-10 w-10 text-primary mb-2" />
                        <CardTitle className="text-md font-semibold text-foreground">{t(link.labelKey as any)}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{t(link.descriptionKey as any)}</p>
                    </Card>
                 </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
