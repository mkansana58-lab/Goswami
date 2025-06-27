"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpenCheck, CheckSquare, Newspaper, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

export function BottomNavigationBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const navLinks = [
    { name: t('navHome'), href: '/', icon: Home },
    { name: t('navCourses'), href: '/courses', icon: BookOpenCheck },
    { name: t('navTest'), href: '/tests', icon: CheckSquare },
    { name: t('navPosts'), href: '/daily-posts', icon: Newspaper },
    { name: t('navAccount'), href: '/account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/20 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-colors duration-200",
                isActive ? "bg-primary text-primary-foreground" : "text-primary/80"
              )}
            >
              <link.icon className={cn("w-6 h-6 mb-1", isActive ? "text-primary-foreground" : "text-primary")} />
              <span className="text-xs">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
