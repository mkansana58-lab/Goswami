
"use client"; // Add "use client" because we're using hooks like useState, useEffect

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation';
import { useState, useEffect } from 'react'; // Import hooks

export default function MainLayout({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setCurrentYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 md:pb-8"> {/* Adjusted mobile padding-bottom */}
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
