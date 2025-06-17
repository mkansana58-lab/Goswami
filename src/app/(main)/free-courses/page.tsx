
"use client";

// This page is deprecated. Free courses are now part of the /study-material page.
// This file can be removed or kept as a redirect if needed, but its content is no longer directly used.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Loader2 } from 'lucide-react';

export default function DeprecatedFreeCoursesPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    router.replace('/study-material');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">{t('loading')}</p>
    </div>
  );
}
