
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck, GraduationCap, Star, ClipboardList, Menu, Tv2, LogIn, LogOut, LayoutDashboard,
  Home, HardDriveDownload, MoreHorizontal, ScissorsLineDashed, HelpingHand, FileText, MessageSquare, Briefcase, BookOpen, FileQuestion, ListChecks, Info
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const primaryNavLinks = [
  { href: '/', labelKey: 'navHome', icon: Home, adminOnly: false },
  { href: '/my-course', labelKey: 'navMyCourse', icon: GraduationCap, adminOnly: false },
  { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2, adminOnly: false },
  { href: '/downloads', labelKey: 'navDownloads', icon: HardDriveDownload, adminOnly: false },
];

const secondaryNavLinks = [
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText, adminOnly: false },
  { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck, adminOnly: false },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare, adminOnly: false },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users, adminOnly: false },
  { href: '/sainik-school-course', labelKey: 'navSainikSchoolCourse', icon: GraduationCap, adminOnly: false },
  { href: '/military-school-course', labelKey: 'navMilitarySchoolCourse', icon: GraduationCap, adminOnly: false },
  { href: '/premium-courses', labelKey: 'navPremiumCourses', icon: Star, adminOnly: false },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu, adminOnly: false },
  { href: '/cutoff-checker', labelKey: 'navCutOffChecker', icon: ScissorsLineDashed, adminOnly: false },
  { href: '/chance-checking', labelKey: 'navChanceChecking', icon: HelpingHand, adminOnly: false },
  { href: '/study-material', labelKey: 'navStudyMaterial', icon: FileText, adminOnly: false },
  { href: '/chat', labelKey: 'navChat', icon: MessageSquare, adminOnly: false },
  { href: '/job-alerts', labelKey: 'navJobAlerts', icon: Briefcase, adminOnly: false },
  { href: '/study-books', labelKey: 'navStudyBooks', icon: BookOpen, adminOnly: false },
  { href: '/quiz', labelKey: 'navQuiz', icon: FileQuestion, adminOnly: false },
  { href: '/syllabus', labelKey: 'navSyllabus', icon: ListChecks, adminOnly: false },
];

const adminNavLinks = [
  { href: '/admin', labelKey: 'navAdminPanel', icon: LayoutDashboard, adminOnly: true },
  { href: '/registrations', labelKey: 'navViewRegistrations', icon: ClipboardList, adminOnly: true },
];

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setIsAdminLoggedIn(localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true');
    }
  }, [pathname]); 

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
    }
    setIsAdminLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
    router.refresh(); // Refresh to update admin-only content visibility
  };

  const handleLoginNav = () => {
    setIsMobileMenuOpen(false);
    router.push('/login');
  }

  const allMobileNavLinks = isAdminLoggedIn ? [...primaryNavLinks, ...secondaryNavLinks, ...adminNavLinks] : [...primaryNavLinks, ...secondaryNavLinks];
  const desktopAdminLinks = adminNavLinks;

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4 h-20">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <ShieldCheck className="h-8 w-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-headline font-bold">{t('appName')}</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary",
                pathname === link.href ? "bg-primary-foreground text-primary" : ""
              )}
            >
              {t(link.labelKey as any)}
            </Link>
          ))}
          {isClient && isAdminLoggedIn && desktopAdminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary flex items-center gap-1",
                pathname === link.href ? "bg-primary-foreground text-primary" : ""
              )}
            >
              <link.icon className="h-4 w-4" /> {t(link.labelKey as any)}
            </Link>
          ))}
          {/* "More" Dropdown for secondary links on desktop */}
          {secondaryNavLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium hover:bg-primary-foreground hover:text-primary">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                {secondaryNavLinks.map((link) => (
                  <DropdownMenuItem key={`desktop-more-${link.href}`} asChild>
                    <Link href={link.href} className={cn(pathname === link.href ? "bg-muted text-primary" : "text-foreground", "w-full justify-start")}>
                      <link.icon className="mr-2 h-4 w-4" />{t(link.labelKey as any)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isClient && (
            isAdminLoggedIn ? (
              <Button variant="outline" size="icon" className="border-accent-foreground text-accent-foreground bg-accent hover:bg-accent/80 hidden md:inline-flex" onClick={handleLogout} title={t('logoutButton')}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{t('logoutButton')}</span>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="border-accent-foreground text-accent-foreground bg-accent hover:bg-accent/80 hidden md:inline-flex" onClick={() => router.push('/login')} title={t('loginButton')}>
                <LogIn className="h-5 w-5" />
                <span className="sr-only">{t('loginButton')}</span>
              </Button>
            )
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')} disabled={language === 'hi'}>
                {t('hindi')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-card p-0 flex flex-col">
                <VisuallyHidden.Root asChild>
                  <SheetTitle>{t('mobileMenuTitle')}</SheetTitle>
                </VisuallyHidden.Root>
                <div className="p-4 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShieldCheck className="h-8 w-8 text-accent" />
                    <h2 className="text-xl font-headline font-bold text-primary">{t('appName')}</h2>
                  </Link>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-1">
                  {allMobileNavLinks.map((link) => {
                    if (link.adminOnly && !isAdminLoggedIn && isClient) return null;
                    return (
                      <Link
                        key={`mobile-${link.href}`}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors hover:bg-muted",
                          pathname === link.href ? "bg-muted text-primary" : "text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {t(link.labelKey as any)}
                      </Link>
                    );
                  })}
                </div>
                <div className="p-4 border-t">
                   {isClient && (
                    isAdminLoggedIn ? (
                      <Button variant="outline" className="w-full justify-start flex items-center gap-3 text-base font-medium hover:bg-destructive hover:text-destructive-foreground" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" /> {t('logoutButton')}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full justify-start flex items-center gap-3 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleLoginNav}>
                        <LogIn className="h-5 w-5" /> {t('loginButton')}
                      </Button>
                    )
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
