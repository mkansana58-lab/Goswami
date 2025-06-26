
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Home, Library, ClipboardCheck, PenSquare, UserCircle } from 'lucide-react';
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
    { href: '/', labelKey: 'navHome', icon: Home },
    { href: '/learning-hub', labelKey: 'ourCourses', icon: Library },
    { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck },
    { href: '/learning-hub?tab=daily-posts', labelKey: 'dailyPosts', icon: PenSquare },
    { href: '/student-profile', labelKey: 'navAccount', icon: UserCircle },
  ], []);

  if (!isClient || !isStudentLoggedIn) {
    return null; // Don't render the bar if not logged in or on server
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border shadow-top p-1 z-40 h-16 print:hidden">
      <div className="container mx-auto flex justify-around items-center h-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.href} passHref>
              <div className={cn(
                "flex flex-col items-center justify-center text-center cursor-pointer group rounded-md w-full h-full gap-0.5 transition-colors duration-200",
                 isActive 
                   ? "bg-primary text-primary-foreground" 
                   : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
              )}>
                <link.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium w-full truncate">
                  {t(link.labelKey as any)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
