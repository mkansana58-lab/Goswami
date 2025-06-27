
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';
import { Bell, User, Menu, Sun, Moon, Settings as SettingsIcon, Shield, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { ADMIN_LOGGED_IN_KEY, STUDENT_LOGGED_IN_KEY } from '@/lib/constants';

export function Header() {
  const { t } = useLanguage();
  const { theme, setTheme } = useSettings();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
      setIsAdmin(adminStatus);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STUDENT_LOGGED_IN_KEY);
      localStorage.removeItem(ADMIN_LOGGED_IN_KEY); // Also log out admin
    }
    router.push('/student-login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline text-lg">
              {t('appName')}
            </span>
          </Link>
        </div>
        
        {/* Mobile Menu Button - can be used for a sidebar later */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-1">
             <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('myCourseSectionTitle')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/student-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('studentProfileTitle')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>{t('settings')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                <span>{t('darkMode')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {isClient && isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => router.push('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>{t('adminPanelTitle')}</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logoutButton')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
