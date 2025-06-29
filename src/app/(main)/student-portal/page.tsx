
"use client";

import { useLanguage } from "@/hooks/use-language";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Award, CalendarCheck, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentPortalPage() {
    const { t } = useLanguage();

    const portalLinks = [
        { href: '/admit-card', titleKey: 'admitCard', description: 'Download your exam admit card', icon: FileText, enabled: true },
        { href: '/result', titleKey: 'downloadResult', description: 'Check and download your result', icon: Award, enabled: true },
        { href: '/city-intimation', titleKey: 'cityIntimationSlip', description: 'Check your exam city', icon: CalendarCheck, enabled: true },
        { href: '/scholarship-confirmation', titleKey: 'confirmationPage', description: 'Download your application form', icon: Download, enabled: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Briefcase className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('studentPortal')}</h1>
                <p className="text-muted-foreground">All your important documents and results in one place.</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
                {portalLinks.map(link => (
                    <Link key={link.titleKey} href={link.href} passHref>
                        <Card className={cn(
                            "hover:border-primary/50 hover:bg-accent transition-all",
                            !link.enabled && "bg-muted/50 hover:border-muted-foreground/20 cursor-not-allowed"
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <link.icon className={cn("h-8 w-8", link.enabled ? "text-primary" : "text-muted-foreground")} />
                                    <div>
                                        <CardTitle className="text-lg">{t(link.titleKey as any)}</CardTitle>
                                        <CardDescription className="text-xs">{link.description}</CardDescription>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                             {!link.enabled && (
                                <CardContent className="p-4 pt-0 text-center">
                                    <p className="text-xs font-semibold text-primary/80">{t('comingSoon')}</p>
                                </CardContent>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
