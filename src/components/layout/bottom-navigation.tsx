
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Home, Library, Bot, FileSignature, User } from 'lucide-react';
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
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [checkLoginStatus]);
  
  const navLinks = React.useMemo(() => [
    { href: '/', labelKey: 'navHome', icon: Home },
    { href: '/learning-hub', labelKey: 'learn', icon: Library },
    { href: '/tests', labelKey: 'aiTest', icon: Bot },
    { href: '/scholarship', labelKey: 'apply', icon: FileSignature },
    { href: '/student-profile', labelKey: 'navAccount', icon: User },
  ], []);

  if (!isClient || !isStudentLoggedIn) {
    return null; // Don't render if not logged in or on server
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t z-40 h-16 print:hidden">
      <div className="flex justify-around items-center h-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.href} passHref>
              <div className={cn(
                "flex flex-col items-center justify-center text-center cursor-pointer group w-full h-full gap-0.5 transition-colors duration-200 rounded-md",
                 isActive 
                   ? "text-primary-foreground bg-primary" 
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
