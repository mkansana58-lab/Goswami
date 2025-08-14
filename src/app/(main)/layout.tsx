
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { student, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is still loading, do nothing.
    if (isLoading) {
      return;
    }

    // If auth has loaded and there's no student, redirect to login.
    // Allow access to admin login if they are trying to go there.
    if (!student && pathname !== '/admin-login') {
      router.replace('/student-login');
    }
  }, [student, isLoading, router, pathname]);

  if (isLoading || !student) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
