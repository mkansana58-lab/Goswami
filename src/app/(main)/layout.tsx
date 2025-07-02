
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { setupForegroundMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { student, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !student) {
      router.replace('/student-login');
      return;
    }
  }, [student, isLoading, router]);

  useEffect(() => {
    // This function sets up a listener for foreground notifications
    setupForegroundMessageListener((payload) => {
        toast({
            title: payload.notification.title,
            description: payload.notification.body,
        });
    });
  }, [toast]);


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
