
"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Tractor, Target, ShoppingCart, Wheat, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const games = [
    {
        icon: Tractor,
        titleKey: "tractorGameTitle",
        descKey: "tractorGameDesc",
    },
    {
        icon: Target,
        titleKey: "shootingGameTitle",
        descKey: "shootingGameDesc",
    },
    {
        icon: ShoppingCart,
        titleKey: "marketGameTitle",
        descKey: "marketGameDesc",
    },
    {
        icon: Wheat,
        titleKey: "farmerGameTitle",
        descKey: "farmerGameDesc",
    },
    {
        icon: Sparkles,
        titleKey: "festivalGameTitle",
        descKey: "festivalGameDesc",
    },
];

const cardColors = [
    "border-green-500/50 hover:bg-green-950/20 text-green-400",
    "border-blue-500/50 hover:bg-blue-950/20 text-blue-400",
    "border-yellow-500/50 hover:bg-yellow-950/20 text-yellow-400",
    "border-red-500/50 hover:bg-red-950/20 text-red-400",
    "border-pink-500/50 hover:bg-pink-950/20 text-pink-400",
];


export default function GameZonePage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div className="text-center">
                <Gamepad2 className="mx-auto h-16 w-16 text-primary" />
                <h1 className="text-4xl font-bold text-primary mt-2">गांव की लाइफ + पढ़ाई</h1>
                <p className="text-muted-foreground mt-2 text-lg">सुपर मजेदार एजुकेशनल गेम्स</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <Card key={game.titleKey} className={cn("flex flex-col bg-card/70 backdrop-blur-sm transition-all", cardColors[index % cardColors.length])}>
                        <CardHeader className="items-center text-center">
                            <game.icon className="h-12 w-12 mb-2" />
                            <CardTitle className="text-white">{t(game.titleKey as any)}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow text-center">
                            <CardDescription>{t(game.descKey as any)}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled>
                                {t('comingSoon')}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
