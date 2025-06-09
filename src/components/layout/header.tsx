
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck, GraduationCap, Star, ClipboardList, Menu, Tv2, LogIn, LogOut, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';


const navLinks = [
  { href: '/', labelKey: 'navHome', icon: ShieldCheck, adminOnly: false },
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText, adminOnly: false },
  { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck, adminOnly: false },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare, adminOnly: false },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users, adminOnly: false },
  { href: '/sainik-school-course', labelKey: 'navSainikSchoolCourse', icon: GraduationCap, adminOnly: false },
  { href: '/military-school-course', labelKey: 'navMilitarySchoolCourse', icon: GraduationCap, adminOnly: false },
  { href: '/premium-courses', labelKey: 'navPremiumCourses', icon: Star, adminOnly: false },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu, adminOnly: false },
  { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2, adminOnly: false },
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
  };

  const handleLoginNav = () => {
    setIsMobileMenuOpen(false);
    router.push('/login');
  }

  const allNavLinks = isAdminLoggedIn ? [...navLinks, ...adminNavLinks] : navLinks;
  const desktopAdminLinks = adminNavLinks;


  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4 h-20">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <ShieldCheck className="h-8 w-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-headline font-bold">{t('appName')}</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
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
        </nav>

        <div className="flex items-center gap-2">
          {isClient && (
            isAdminLoggedIn ? (
              <Button variant="outline" size="icon" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hidden md:inline-flex" onClick={handleLogout} title={t('logoutButton')}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{t('logoutButton')}</span>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hidden md:inline-flex" onClick={() => router.push('/login')} title={t('loginButton')}>
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
              <SheetContent side="left" className="w-[280px] bg-card p-4">
                 <VisuallyHidden.Root asChild>
                    <SheetTitle>{t('mobileMenuTitle')}</SheetTitle>
                 </VisuallyHidden.Root>
                <div className="flex flex-col space-y-3 pt-4">
                  {allNavLinks.map((link) => {
                    if (link.adminOnly && !isAdminLoggedIn && isClient) return null;
                    return (
                      <Link
                        key={`mobile-${link.href}`}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-muted",
                          pathname === link.href ? "bg-muted text-primary" : "text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {t(link.labelKey as any)}
                      </Link>
                    );
                  })}
                   {isClient && (
                    isAdminLoggedIn ? (
                      <Button variant="ghost" className="w-full justify-start flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" /> {t('logoutButton')}
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full justify-start flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={handleLoginNav}>
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

    