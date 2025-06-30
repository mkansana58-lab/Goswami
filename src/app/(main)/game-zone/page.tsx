
"use client";

import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Sprout, Target, Banknote, Rocket, ChevronRight, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LearningGamesPage() {
    const { t } = useLanguage();

    const games = [
        { 
            href: '/festival-quiz',
            titleKey: "festivalQuiz", 
            descriptionKey: "festivalQuizDescription",
            icon: Rocket,
            enabled: true,
            color: "hover:border-pink-500/80 hover:bg-pink-500/10"
        },
        { 
            href: '#',
            titleKey: "shootTheAnswer", 
            descriptionKey: "shootTheAnswerDescription",
            icon: Target,
            enabled: false,
            color: "hover:border-blue-500/80 hover:bg-blue-500/10"
        },
        { 
            href: '#',
            titleKey: "villageMarket", 
            descriptionKey: "villageMarketDescription",
            icon: Banknote,
            enabled: false,
            color: "hover:border-green-500/80 hover:bg-green-500/10"
        },
        { 
            href: '#',
            titleKey: "smartKisan", 
            descriptionKey: "smartKisanDescription",
            icon: Sprout,
            enabled: false,
            color: "hover:border-yellow-500/80 hover:bg-yellow-500/10"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Sparkles className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('learningGames')}</h1>
                <p className="text-muted-foreground">गांव की लाइफ + पढ़ाई = सुपर मजेदार एजुकेशनल गेम्स</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
                {games.map(game => (
                    <Link key={game.titleKey} href={game.href} passHref className={!game.enabled ? "pointer-events-none" : ""}>
                        <Card className={cn(
                            "transition-all",
                             game.enabled ? game.color : "bg-muted/50 hover:border-muted-foreground/20 cursor-not-allowed"
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <game.icon className={cn("h-8 w-8", game.enabled ? "text-primary" : "text-muted-foreground")} />
                                    <div>
                                        <CardTitle className="text-lg">{t(game.titleKey as any)}</CardTitle>
                                        <CardDescription className="text-xs">{game.enabled ? t(game.descriptionKey as any) : t('comingSoon')}</CardDescription>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
