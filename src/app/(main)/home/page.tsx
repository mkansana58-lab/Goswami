
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { featureGridLinks } from '@/lib/nav-links';
import { cn } from '@/lib/utils';


const cardColors = [
    "hover:bg-purple-500/20 hover:border-purple-500 text-purple-400",
    "hover:bg-blue-500/20 hover:border-blue-500 text-blue-400",
    "hover:bg-green-500/20 hover:border-green-500 text-green-400",
    "hover:bg-yellow-500/20 hover:border-yellow-500 text-yellow-400",
    "hover:bg-red-500/20 hover:border-red-500 text-red-400",
    "hover:bg-indigo-500/20 hover:border-indigo-500 text-indigo-400",
    "hover:bg-pink-500/20 hover:border-pink-500 text-pink-400",
    "hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400",
    "hover:bg-orange-500/20 hover:border-orange-500 text-orange-400",
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
      </div>

      <Card className="w-full max-w-2xl mb-8 bg-card border-primary/20 shadow-lg rounded-xl">
        <CardContent className="p-4">
          <p className="font-signature text-primary text-xl">
            "{t('quote')}"
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
        {featureGridLinks.map((link, index) => (
          <Link href={link.href} key={link.href} passHref>
            <Card className={cn(
                "bg-card transition-colors duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-2 md:p-3 aspect-square shadow-md rounded-xl border border-border/10",
                cardColors[index % cardColors.length]
                )}>
              <link.icon className="h-7 w-7 md:h-8 md:w-8 mb-2" />
              <p className="text-xs md:text-sm font-medium">{t(link.textKey as any)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
