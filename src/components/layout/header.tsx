
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck, GraduationCap, Star, ClipboardList, Menu, Tv2, LogIn, LogOut, LayoutDashboard,
  Home, DownloadCloud, MoreHorizontal, ScissorsLineDashed, HelpingHand, FileText, MessageSquare, Briefcase, BookOpen, FileQuestion, ListChecks, Info, Bell,
  ShoppingBag, Gift, Newspaper, History
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle as RadixSheetTitle } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react';


const primaryNavLinks = [
  { href: '/', labelKey: 'navHome', icon: Home, adminOnly: false },
  { href: '/my-course', labelKey: 'navMyCourse', icon: GraduationCap, adminOnly: false },
  { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2, adminOnly: false },
  { href: '/downloads', labelKey: 'navDownloads', icon: DownloadCloud, adminOnly: false },
];

// Corresponds to the image grid, excluding those already in primaryNavLinks
const secondaryNavLinks = [
  { href: '/premium-courses', labelKey: 'paidCourses', icon: ShoppingBag, adminOnly: false },
  { href: '/tests', labelKey: 'testSeries', icon: ClipboardCheck, adminOnly: false },
  { href: '/free-courses', labelKey: 'freeCourses', icon: Gift, adminOnly: false },
  { href: '/tests', labelKey: 'previousPapersNav', icon: History, adminOnly: false },
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
  }, [pathname]); // Re-check on pathname change if needed, or on a global state change

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
    }
    setIsAdminLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
    router.refresh(); 
  };

  const handleLoginNav = () => {
    setIsMobileMenuOpen(false);
    router.push('/login');
  }

  // Combine all links for the mobile menu, filtering admin links if not logged in.
  const allMobileNavLinks = [
    ...primaryNavLinks,
    ...secondaryNavLinks.filter(link => !primaryNavLinks.some(pLink => pLink.href === link.href && pLink.labelKey === link.labelKey)), // Avoid duplicates from primary
    ...(isClient && isAdminLoggedIn ? adminNavLinks : [])
  ].filter((link, index, self) => index === self.findIndex((l) => l.href === link.href && l.labelKey === link.labelKey)); // Ensure unique items

  // For desktop "More" dropdown, only include secondary links not already in primary.
  const uniqueSecondaryLinksForDesktop = secondaryNavLinks.filter(
    link => !primaryNavLinks.some(pLink => pLink.href === link.href && pLink.labelKey === link.labelKey)
  ).filter((link, index, self) => index === self.findIndex((l) => l.href === link.href && l.labelKey === link.labelKey)); // Ensure unique items


  return (
    <header className="bg-background text-foreground sticky top-0 z-50 shadow-md border-b">
      <div className="container mx-auto flex items-center justify-between p-3 h-16">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background p-0 flex flex-col border-r">
                 <VisuallyHidden.Root>
                  <RadixSheetTitle>{t('mobileMenuTitle')}</RadixSheetTitle>
                </VisuallyHidden.Root>
                <div className="p-4 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h2 className="text-xl font-headline font-bold text-primary">{t('appName')}</h2>
                  </Link>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-1">
                  {allMobileNavLinks.map((link) => (
                     <Link
                        key={`mobile-${link.href}-${link.labelKey}`}
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
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-lg md:text-xl font-headline font-bold text-primary hidden sm:block">{t('appName')}</h1>
          </Link>
        </div>


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
                  <DropdownMenuItem key={`desktop-more-${link.href}-${link.labelKey}`} asChild className="focus:bg-muted focus:text-primary">
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
          
          <div className="hidden md:flex">
            {isClient && (
              isAdminLoggedIn ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <LogOut className="mr-2 h-4 w-4" /> {t('logoutButton')}
                </Button>
              ) : (
                <Button size="sm" onClick={handleLoginNav} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <LogIn className="mr-2 h-4 w-4" /> {t('loginButton')}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
