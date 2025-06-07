
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { LanguageProvider } from '@/context/language-context';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-primary text-primary-foreground text-center p-4">
          <p>&copy; {new Date().getFullYear()} Go Swami Defence Academy. All rights reserved.</p>
        </footer>
      </div>
    </LanguageProvider>
  );
}
