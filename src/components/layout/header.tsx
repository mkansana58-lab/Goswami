"use client";

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This component is not currently used in the main layout but is kept for potential future use.
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">My App</span>
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          {/* Add nav items here */}
        </nav>
      </div>
    </header>
  );
}
