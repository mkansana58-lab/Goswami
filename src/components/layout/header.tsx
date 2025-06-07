
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck, GraduationCap, Star, ClipboardList, Menu, Tv2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';

const navLinks = [
  { href: '/', labelKey: 'navHome', icon: ShieldCheck },
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText },
  { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users },
  { href: '/sainik-school-course', labelKey: 'navSainikSchoolCourse', icon: GraduationCap },
  { href: '/military-school-course', labelKey: 'navMilitarySchoolCourse', icon: GraduationCap },
  { href: '/premium-courses', labelKey: 'navPremiumCourses', icon: Star },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu },
  { href: '/live-classes', labelKey: 'navLiveClasses', icon: Tv2 },
];

// NOTE: This is a placeholder for actual admin authentication.
// In a real application, this value would come from a secure authentication context.
const isAdmin = true; 

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
          {isAdmin && (
            <Link
              href="/registrations"
              className={cn(
                "px-2 py-1.5 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary flex items-center gap-1",
                pathname === "/registrations" ? "bg-primary-foreground text-primary" : ""
              )}
            >
              <ClipboardList className="h-4 w-4" /> {t('navViewRegistrations')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
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
                <div className="flex flex-col space-y-3 pt-8">
                  {navLinks.map((link) => (
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
                  ))}
                  {isAdmin && (
                    <Link
                      href="/registrations"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-muted",
                        pathname === "/registrations" ? "bg-muted text-primary" : "text-foreground"
                      )}
                       onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ClipboardList className="h-5 w-5" /> {t('navViewRegistrations')}
                    </Link>
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
