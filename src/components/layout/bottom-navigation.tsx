"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { bottomNavLinks } from '@/lib/nav-links';

export function BottomNavigationBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/20 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {bottomNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 group transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <link.icon className={cn("w-6 h-6 mb-1")} />
              <span className="text-xs">{t(link.textKey as any)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
