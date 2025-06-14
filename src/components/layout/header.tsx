
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck, GraduationCap, Star, ClipboardList, Menu, Tv2, LogIn, LogOut, LayoutDashboard,
  Home, HardDriveDownload, MoreHorizontal, ScissorsLineDashed, HelpingHand, FileText, MessageSquare, Briefcase, BookOpen, FileQuestion, ListChecks, Info, Bell,
  ShoppingBag, Gift, Newspaper, // Added ShoppingBag, Gift, Newspaper
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle as RadixSheetTitle } from '@/components/ui/sheet'; // Added SheetHeader for title
import React, { useEffect, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';


const primaryNavLinks = [
  { href: '/', labelKey: 'navHome', icon: Home, adminOnly: false },
  { href: '/my-course', labelKey: 'navMyCourse', icon: GraduationCap, adminOnly: false },
  { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2, adminOnly: false },
  { href: '/downloads', labelKey: 'navDownloads', icon: HardDriveDownload, adminOnly: false },
];

// Links from the image's grid that might go into a "More" dropdown or mobile menu
const secondaryNavLinks = [
  { href: '/premium-courses', labelKey: 'paidCourses', icon: ShoppingBag, adminOnly: false },
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck, adminOnly: false },
  { href: '/free-courses', labelKey: 'freeCourses', icon: Gift, adminOnly: false },
  // '/tests' already covers previous papers; using a distinct key for label if needed.
  // { href: '/tests', labelKey: 'previousPapersNav', icon: History, adminOnly: false }, 
  { href: '/current-affairs', labelKey: 'currentAffairs', icon: Newspaper, adminOnly: false },
  { href: '/quiz', labelKey: 'navQuiz', icon: FileQuestion, adminOnly: false },
  { href: '/syllabus', labelKey: 'navSyllabus', icon: ListChecks, adminOnly: false },
  { href: '/study-books', labelKey: 'navStudyBooks', icon: BookOpen, adminOnly: false },
  { href: '/job-alerts', labelKey: 'navJobAlerts', icon: Briefcase, adminOnly: false },
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText, adminOnly: false },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare, adminOnly: false },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users, adminOnly: false },
  { href: '/sainik-school-course', labelKey: 'navSainikSchoolCourse', icon: GraduationCap, adminOnly: false },
  { href: '/military-school-course', labelKey: 'navMilitarySchoolCourse', icon: GraduationCap, adminOnly: false },
  // { href: '/premium-courses', labelKey: 'navPremiumCourses', icon: Star, adminOnly: false }, // already in paidCourses
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu, adminOnly: false },
  { href: '/cutoff-checker', labelKey: 'navCutOffChecker', icon: ScissorsLineDashed, adminOnly: false },
  { href: '/chance-checking', labelKey: 'navChanceChecking', icon: HelpingHand, adminOnly: false },
  { href: '/study-material', labelKey: 'navStudyMaterial', icon: FileText, adminOnly: false },
  { href: '/chat', labelKey: 'navChat', icon: MessageSquare, adminOnly: false },
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
    setIsMobileMenuOpen(false); // Close menu on logout
    router.push('/login');
    router.refresh(); 
  };

  const handleLoginNav = () => {
    setIsMobileMenuOpen(false); // Close menu on login nav
    router.push('/login');
  }

  const allMobileNavLinks = isAdminLoggedIn ? [...primaryNavLinks, ...secondaryNavLinks, ...adminNavLinks] : [...primaryNavLinks, ...secondaryNavLinks];
  
  // Filter out duplicates for desktop "More" menu if any
  const uniqueSecondaryLinksForDesktop = secondaryNavLinks.filter(
    (link, index, self) => index === self.findIndex((l) => l.href === link.href && l.labelKey === link.labelKey)
  );


  return (
    <header className="bg-background text-foreground sticky top-0 z-50 shadow-md border-b">
      <div className="container mx-auto flex items-center justify-between p-3 h-16">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-lg md:text-xl font-headline font-bold text-primary">{t('appName')}</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors hover:bg-muted hover:text-primary",
                pathname === link.href ? "bg-muted text-primary font-semibold" : "text-foreground"
              )}
            >
              {t(link.labelKey as any)}
            </Link>
          ))}
          {isClient && isAdminLoggedIn && adminNavLinks.map((link) => (
             <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors hover:bg-muted hover:text-primary flex items-center gap-1",
                pathname === link.href ? "bg-muted text-primary font-semibold" : "text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" /> {t(link.labelKey as any)}
            </Link>
          ))}

          {uniqueSecondaryLinksForDesktop.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium hover:bg-muted hover:text-primary">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto bg-background border-border shadow-lg">
                {uniqueSecondaryLinksForDesktop.map((link) => (
                  <DropdownMenuItem key={`desktop-more-${link.href}`} asChild className="focus:bg-muted focus:text-primary">
                    <Link href={link.href} className={cn(pathname === link.href ? "bg-muted text-primary" : "text-foreground", "w-full justify-start")}>
                      <link.icon className="mr-2 h-4 w-4 text-primary/80" />{t(link.labelKey as any)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-primary" title={t('notifications')}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t('notifications')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-primary">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border shadow-lg">
              <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'} className="focus:bg-muted focus:text-primary">
                {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')} disabled={language === 'hi'} className="focus:bg-muted focus:text-primary">
                {t('hindi')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background p-0 flex flex-col border-r">
                <VisuallyHidden.Root asChild>
                  <RadixSheetTitle>{t('mobileMenuTitle')}</RadixSheetTitle>
                </VisuallyHidden.Root>
                <div className="p-4 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h2 className="text-xl font-headline font-bold text-primary">{t('appName')}</h2>
                  </Link>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-1">
                  {primaryNavLinks.map((link) => (
                     <Link
                        key={`mobile-primary-${link.href}`}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors hover:bg-muted",
                          pathname === link.href ? "bg-muted text-primary" : "text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-5 w-5 text-primary" />
                        {t(link.labelKey as any)}
                      </Link>
                  ))}
                  <DropdownMenuSeparator className="my-2"/>
                  {allMobileNavLinks.filter(l => !primaryNavLinks.find(p => p.href === l.href)).map((link) => {
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
                      <Button variant="outline" className="w-full justify-start flex items-center gap-3 text-base font-medium hover:bg-destructive hover:text-destructive-foreground border-destructive text-destructive" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" /> {t('logoutButton')}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full justify-start flex items-center gap-3 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleLoginNav}>
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

import * as SheetPrimitive from "@radix-ui/react-dialog";
