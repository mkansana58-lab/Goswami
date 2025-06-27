
"use client";

import type { ReactNode } from 'react';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';
import { Header } from '@/components/layout/header';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { STUDENT_LOGGED_IN_KEY } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const publicPaths = ['/student-login', '/admin-login', '/toppers']; // Toppers page is public
      const pathIsPublic = publicPaths.some(p => pathname.startsWith(p));
      
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow px-4 pt-4 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
