
"use client";

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { STUDENT_LOGGED_IN_KEY } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function MainLayout({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const publicPaths = ['/student-login', '/login'];
      const pathIsPublic = publicPaths.includes(pathname);
      
      if (!localStorage.getItem(STUDENT_LOGGED_IN_KEY) && !pathIsPublic) {
        router.replace('/student-login');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [isClient, pathname, router]);

  if (isCheckingAuth && isClient) {
     return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 mt-2 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNavigationBar />
      <footer className="bg-primary text-primary-foreground text-center p-4">
        <p>
          &copy; {currentYear !== null ? currentYear : new Date().getFullYear()}{' '}
          Go Swami Defence Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
