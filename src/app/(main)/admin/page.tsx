
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, ClipboardCheck, PlaySquare, LayoutDashboard, AlertTriangle, ExternalLink, LogIn, DownloadCloud, ListChecks, FileQuestion, NewspaperIcon, BookOpenIcon, Briefcase, ShieldCheck, Star, Info, Tv2 } from 'lucide-react'; // Added Tv2
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

interface AdminSection {
  key: string;
  titleKey: keyof ReturnType<typeof useLanguage>['t'];
  descriptionKey: keyof ReturnType<typeof useLanguage>['t'];
  href: string;
  icon: React.ElementType;
  managementNoteKey?: keyof ReturnType<typeof useLanguage>['t'];
}

const adminSections: AdminSection[] = [
  { key: 'registrations', titleKey: 'manageRegistrations', descriptionKey: 'manageRegistrationsDesc', href: '/registrations', icon: Users },
  { key: 'schedule', titleKey: 'manageSchedule', descriptionKey: 'manageScheduleDesc', href: '/schedule', icon: CalendarDays },
  { key: 'liveClasses', titleKey: 'manageLiveClasses', descriptionKey: 'manageLiveClassesDesc', href: '/live-classes', icon: Tv2 }, // Re-added
  { key: 'tests', titleKey: 'manageTests', descriptionKey: 'manageTestsDesc', href: '/tests', icon: ClipboardCheck },
  { key: 'videos', titleKey: 'manageVideos', descriptionKey: 'manageVideosDesc', href: '/videos', icon: PlaySquare },
  { key: 'downloads', titleKey: 'navDownloads', descriptionKey: 'adminManageDownloadsDesc', href: '/downloads', icon: DownloadCloud },
  { key: 'syllabus', titleKey: 'navSyllabus', descriptionKey: 'adminSyllabusDesc', href: '/syllabus', icon: ListChecks, managementNoteKey: 'adminManageSyllabusNote'},
  { key: 'quizzes', titleKey: 'navQuiz', descriptionKey: 'adminQuizDesc', href: '/quiz', icon: FileQuestion, managementNoteKey: 'adminManageQuizzesNote'},
  { key: 'currentAffairs', titleKey: 'navCurrentAffairs', descriptionKey: 'adminCurrentAffairsDesc', href: '/current-affairs', icon: NewspaperIcon, managementNoteKey: 'adminManageCurrentAffairsNote'},
  { key: 'studyBooks', titleKey: 'navStudyBooks', descriptionKey: 'adminStudyBooksDesc', href: '/study-books', icon: BookOpenIcon, managementNoteKey: 'adminManageBooksNote'},
  { key: 'jobAlerts', titleKey: 'navJobAlerts', descriptionKey: 'adminJobAlertsDesc', href: '/job-alerts', icon: Briefcase, managementNoteKey: 'adminManageJobAlertsNote'},
  { key: 'courses', titleKey: 'manageCourses', descriptionKey: 'adminCoursesDesc', href: '/premium-courses', icon: Star, managementNoteKey: 'adminManageCoursesNote'},
];


export default function AdminPanelPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdminLoggedIn = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
      if (!isAdminLoggedIn) {
        setIsAuthorized(false); 
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LayoutDashboard className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  if (!isAuthorized) {
     return (
        <div className="max-w-2xl mx-auto space-y-8 text-center py-10">
            <Card className="shadow-xl border-destructive">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                        <AlertTriangle /> {t('accessDenied')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t('accessDeniedMessage')}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('adminMustLoginViaDedicatedPage') || "Please log in as an administrator via the admin login page to access this panel."}
                    </p>
                    <Button asChild>
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" /> {t('adminLoginNav')}
                      </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4"><LayoutDashboard className="h-16 w-16 text-primary" /></div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('adminPanelTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('adminPanelDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">{t('adminPanelInfoTitle') || "Admin Panel Information"}</AlertTitle>
            <AlertDescription className="text-foreground/80">
              {t('adminPanelInfoDesc') || "This panel provides quick links to various sections. Most content (like courses, books, syllabus, etc.) is managed directly in the Firebase Firestore database. Some sections like Live Classes or Schedule have on-page forms for adding content when you are logged in as an admin."}
            </AlertDescription>
          </Alert>
          <div className="grid md:grid-cols-2 gap-6">
            {adminSections.map((section) => (
              <Card key={section.key} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-start space-x-4 pb-3">
                  <section.icon className="h-10 w-10 text-accent mt-1" />
                  <div>
                    <CardTitle className="text-xl font-headline text-primary">{t(section.titleKey)}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground pt-1">{t(section.descriptionKey)}</CardDescription>
                    {section.managementNoteKey && <CardDescription className="text-xs text-primary/70 pt-1 italic">{t(section.managementNoteKey)}</CardDescription>}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={section.href}>
                      {t('viewSection') || "View/Manage Section"} <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    

    
