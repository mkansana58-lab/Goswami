
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Home as HomeIcon, UserCircle, PackageSearch, CalendarDays } from 'lucide-react'; // CalendarDays was used for Schedule
import React, { useEffect, useState } from 'react';
import { STUDENT_LOGGED_IN_KEY } from '@/lib/constants';
import { Library } from 'lucide-react'; // Example, choose appropriate icon if needed

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
    checkLoginStatus(); // Initial check

    window.addEventListener('studentProfileUpdated', checkLoginStatus);
    window.addEventListener('studentLoggedOut', checkLoginStatus);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STUDENT_LOGGED_IN_KEY) {
        checkLoginStatus();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('studentProfileUpdated', checkLoginStatus);
      window.removeEventListener('studentLoggedOut', checkLoginStatus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isClient) {
      checkLoginStatus();
    }
  }, [pathname, isClient, checkLoginStatus]);

  const navLinks = React.useMemo(() => [
    { href: '/', labelKey: 'navHome', icon: HomeIcon },
    ...(isClient && isStudentLoggedIn ? [{ href: '/student-profile', labelKey: 'studentProfileTitle', icon: UserCircle }] : []),
    { href: '/learning-hub', labelKey: 'navLearningHub', icon: PackageSearch },
    // { href: '/schedule', labelKey: 'navSchedule', icon: CalendarDays }, // Schedule removed
    // Consider adding another relevant link here if space allows and makes sense, e.g., Study Material
     { href: '/study-material', labelKey: 'navStudyMaterial', icon: Library }, 
  ].filter(Boolean) // Filter out any undefined entries if logic gets complex
  .slice(0, 4), // Ensure only 4 items max for bottom nav
  [isClient, isStudentLoggedIn, t]);

  if (!isClient) {
    return <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t h-16 z-40 print:hidden" />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border shadow-top p-2 z-40 h-16 print:hidden">
      <div className="container mx-auto flex justify-around items-center h-full">
        {navLinks.map((link) => (
          <Link href={link.href} key={`${link.href}-bottom-nav-${link.labelKey}`} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center text-center cursor-pointer group p-1 rounded-md w-1/4 max-w-[calc(25%-0.5rem)]", // Adjusted width to ensure items fit
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

    