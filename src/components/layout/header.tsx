"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, Bell, User, ShieldCheck, Loader2, Newspaper, Trophy, GraduationCap, AlertTriangle } from 'lucide-react';
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from '@/hooks/use-language';
import { useRouter, usePathname } from 'next/navigation';
import { sidebarLinks } from '@/lib/nav-links';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/hooks/use-auth';
import { getNotifications, type Notification, firebaseConfig, NotificationCategory } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';


const notificationIcons: Record<NotificationCategory, React.ElementType> = {
    general: Bell,
    news: Newspaper,
    result: Trophy,
    scholarship: GraduationCap,
    alert: AlertTriangle
};

const NotificationIcon = ({ category }: { category: NotificationCategory }) => {
    const Icon = notificationIcons[category] || Bell;
    return <Icon className="h-5 w-5 mr-3 text-primary" />;
}

export function Header() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { admin, student, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isFirebaseConfigured = !!firebaseConfig.projectId;

  const fetchNotifications = async () => {
    if (!isFirebaseConfigured) {
        setIsLoadingNotifications(false);
        return;
    }
    setIsLoadingNotifications(true);
    try {
        const fetched = await getNotifications();
        setNotifications(fetched);
    } catch (e) {
        console.error(e);
        setNotifications([]);
    } finally {
        setIsLoadingNotifications(false);
    }
  };

  const handleAdminClick = () => {
    setIsSheetOpen(false);
    if (admin) {
      router.push('/admin');
    } else {
      router.push('/admin-login');
    }
  };
  
  const handleAccountClick = () => {
    setIsSheetOpen(false);
    router.push('/account');
  };

  const handleSettingsClick = () => {
    setIsSheetOpen(false);
    router.push('/settings');
  };

  const handleLogout = () => {
    setIsSheetOpen(false);
    logout();
    router.push('/student-login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 bg-background p-0 flex flex-col">
              <VisuallyHidden><SheetTitle>{t('appName')}</SheetTitle></VisuallyHidden>
                <div className="p-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-10 w-10 text-primary" /><h2 className="text-lg font-bold text-primary">{t('appName')}</h2>
                    </div>
                </div>
              <ScrollArea className="flex-grow">
                <nav className="mt-4 flex-grow px-2"><ul className="space-y-1">
                  {sidebarLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                          link.textKey === 'adminPanel' ? 
                          <li key={link.href}><button onClick={handleAdminClick} className={cn("flex items-center gap-3 rounded-md p-2 text-base font-medium text-primary hover:bg-accent w-full text-left", isActive && "bg-accent")}><link.icon className="h-5 w-5" />{t(link.textKey as any)}</button></li> :
                          <li key={link.href}><Link href={link.href} onClick={() => setIsSheetOpen(false)} className={cn("flex items-center gap-3 rounded-md p-2 text-base font-medium text-primary hover:bg-accent", isActive && "bg-accent")}><link.icon className="h-5 w-5" />{t(link.textKey as any)}</Link></li>
                      )
                  })}</ul></nav>
              </ScrollArea>
              {admin && <div className="p-4 border-t border-border/20 mt-auto"><div className="flex items-center gap-3"><Avatar><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar"/><AvatarFallback>A</AvatarFallback></Avatar><div><p className="text-sm font-semibold text-primary">{admin.name}</p></div></div></div>}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
            <Sheet onOpenChange={(open) => open && fetchNotifications()}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary">
                        <Bell className="h-6 w-6" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Notifications</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow mt-4 -mx-6">
                      <div className="px-6 space-y-4">
                        {!isFirebaseConfigured ? (
                             <div className="flex flex-col text-destructive text-center p-2 text-sm"><p className="font-bold">Firebase Not Configured</p><p className="whitespace-normal mt-1">Connect a Firebase project to enable.</p></div>
                        ) : isLoadingNotifications ? (
                            <div className="flex justify-center items-center p-4"><Loader2 className="mr-2 h-6 w-6 animate-spin" />Loading...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 rounded-lg border bg-card flex">
                                   <NotificationIcon category={n.category} />
                                   <div className="flex-1">
                                       <p className="font-semibold">{n.title}</p>
                                       <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.content}</p>
                                       <p className="text-xs text-muted-foreground text-right mt-2">
                                           {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ''}
                                       </p>
                                   </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">No new notifications</div>
                        )}
                      </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-primary">
                 <Avatar className="h-8 w-8"><AvatarImage src={student?.photoUrl || `https://placehold.co/40x40.png?text=${(student?.name || 'G')[0]}`} data-ai-hint="user avatar" /><AvatarFallback>{(student?.name || 'G')[0]}</AvatarFallback></Avatar>
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{student?.name || t('myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAccountClick}>{t('profile')}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick}>{t('settings')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminClick}>{t('adminPanel')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
