
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Home as HomeIcon, UserCircle, Cpu, ClipboardCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { STUDENT_LOGGED_IN_KEY } from '@/lib/constants';

export function BottomNavigationBar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

  const checkLoginStatus = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const studentStatus = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      setIsStudentLoggedIn(studentStatus);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    checkLoginStatus();

    const handleAuthChange = () => checkLoginStatus();
    window.addEventListener('studentProfileUpdated', handleAuthChange);
    window.addEventListener('studentLoggedOut', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('studentProfileUpdated', handleAuthChange);
      window.removeEventListener('studentLoggedOut', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isClient) {
      checkLoginStatus();
    }
  }, [pathname, isClient, checkLoginStatus]);

  const navLinks = React.useMemo(() => [
    { href: '/', labelKey: 'navHome', icon: HomeIcon },
    { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck },
    { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu },
    { href: '/student-profile', labelKey: 'studentProfileTitle', icon: UserCircle },
  ], []);

  if (!isClient || !isStudentLoggedIn) {
    return null; // Don't render the bar if not logged in or on server
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border shadow-top p-2 z-40 h-16 print:hidden">
      <div className="container mx-auto flex justify-around items-center h-full">
        {navLinks.map((link) => (
          <Link href={link.href} key={`${link.href}-bottom-nav-${link.labelKey}`} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center text-center cursor-pointer group p-1 rounded-md w-1/4 max-w-[calc(25%-0.5rem)]",
              pathname === link.href ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
            )}>
              <link.icon className={cn("h-5 w-5 mb-0.5 transition-colors", pathname === link.href ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <span className="text-[10px] leading-tight transition-colors whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {t(link.labelKey as any)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
