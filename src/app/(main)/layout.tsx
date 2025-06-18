
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 md:pb-8"> {/* Adjusted mobile padding-bottom */}
        {children}
      </main>
      <BottomNavigationBar />
      <footer className="bg-primary text-primary-foreground text-center p-4">
        <p>&copy; {new Date().getFullYear()} Go Swami Defence Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
