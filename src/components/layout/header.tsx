
"use client";

import Link from 'next/link';
import { Menu, Bell, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import { sidebarLinks } from '@/lib/nav-links';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { t } = useLanguage();
  const router = useRouter();
  const { admin, logout } = useAuth();

  const handleAdminClick = () => {
    if (admin) {
      router.push('/admin');
    } else {
      router.push('/admin-login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/student-login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 bg-background p-0 flex flex-col">
              <VisuallyHidden>
                <SheetTitle>{t('appName')}</SheetTitle>
              </VisuallyHidden>
                <div className="p-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                        <div>
                            <h2 className="text-lg font-bold text-primary">{t('appName')}</h2>
                            <p className="text-xs text-muted-foreground">डिफेंस एकेडमी</p>
                        </div>
                    </div>
                </div>
              <nav className="mt-4 flex-grow px-2">
                <ul className="space-y-1">
                {sidebarLinks.map((link) => {
                  if (link.textKey === 'adminPanel') {
                    return (
                      <li key={link.href}>
                        <button
                          onClick={handleAdminClick}
                          className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-primary hover:bg-accent w-full text-left"
                        >
                          <link.icon className="h-5 w-5" />
                          {t(link.textKey as any)}
                        </button>
                      </li>
                    )
                  }
                  return (
                    <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-primary hover:bg-accent"
                    >
                      <link.icon className="h-5 w-5" />
                      {t(link.textKey as any)}
                    </Link>
                    </li>
                  )
                })}
                </ul>
              </nav>
              {admin && (
                <div className="p-4 border-t border-border/20 mt-auto">
                      <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar"/>
                              <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="text-sm font-semibold text-primary">{admin.name}</p>
                              <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                      </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-primary">
                <User className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/account')}>
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                {t('settings')}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminClick}>
                {t('adminPanel')}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
