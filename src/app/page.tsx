"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { student, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      // Still checking auth status, do nothing.
      return;
    }

    if (student) {
      // If student is logged in, go to home.
      router.replace('/home');
    } else {
      // If no student, go to login.
      router.replace('/student-login');
    }
  }, [isLoading, student, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
