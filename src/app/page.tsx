"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAppConfig } from '@/lib/firebase';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function SplashScreen() {
    const router = useRouter();
    const [splashImageUrl, setSplashImageUrl] = useState<string | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    useEffect(() => {
        getAppConfig().then(config => {
            setSplashImageUrl(config.splashImageUrl || 'https://placehold.co/1200x800.png'); 
        }).catch(() => {
            setSplashImageUrl('https://placehold.co/1200x800.png');
        }).finally(() => {
            setIsLoadingConfig(false);
        });
    }, []);

    useEffect(() => {
        if (!isLoadingConfig) {
            const timer = setTimeout(() => {
                router.replace('/student-login');
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isLoadingConfig, router]);
    
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
            {isLoadingConfig ? (
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading Academy...</p>
                 </div>
            ) : (
                <div className="w-full h-full relative animate-in fade-in duration-1000">
                    <Image
                        src={splashImageUrl!}
                        alt="Go Swami Defence Academy"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-25"
                        data-ai-hint="portrait teacher"
                        priority
                    />
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-4 bg-black/20">
                        <div className="p-4 rounded-full bg-background/80 shadow-lg animate-pulse">
                            <ShieldCheck className="h-20 w-20 text-primary" />
                        </div>
                        <h1 className="mt-6 text-5xl md:text-7xl font-headline text-primary-foreground drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            Go Swami Defence Academy
                        </h1>
                        <p className="mt-4 text-2xl md:text-3xl font-signature text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                           राष्ट्र प्रथम, शिक्षा सर्वोपरि
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
