import type { ReactNode } from 'react';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
