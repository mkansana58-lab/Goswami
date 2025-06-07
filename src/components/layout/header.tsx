
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BookText, ClipboardCheck, PlaySquare, Users, Cpu, Languages, ShieldCheck } from 'lucide-react';

const navLinks = [
  { href: '/', labelKey: 'navHome', icon: ShieldCheck },
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText },
  { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu },
];

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4 h-20">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-headline font-bold">{t('appName')}</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary",
                pathname === link.href ? "bg-primary-foreground text-primary" : ""
              )}
            >
              {t(link.labelKey as any)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')} disabled={language === 'hi'}>
                {t('hindi')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Trigger (optional, can be implemented with Sidebar or Sheet) */}
          {/* <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button> */}
        </div>
      </div>
    </header>
  );
}
