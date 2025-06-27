"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAppConfig } from '@/lib/firebase';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function SplashScreen() {
    const router = useRouter();
    const [splashImageUrl, setSplashImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAppConfig().then(config => {
            setSplashImageUrl(config.splashImageUrl || 'https://placehold.co/800x1200.png'); 
            setIsLoading(false);
        }).catch(() => {
            setSplashImageUrl('https://placehold.co/800x1200.png');
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                router.replace('/student-login');
            }, 5000); // 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isLoading, router]);
    
    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
            {isLoading ? (
                 <Loader2 className="h-16 w-16 animate-spin text-primary" />
            ) : (
                <>
                    {splashImageUrl && (
                        <Image
                            src={splashImageUrl}
                            alt="Lokesh Goswami Sir"
                            layout="fill"
                            objectFit="cover"
                            className="opacity-20"
                            data-ai-hint="portrait teacher"
                            priority
                        />
                    )}
                    <div className="relative z-10 text-center p-4 animate-in fade-in-50 duration-1000">
                        <ShieldCheck className="mx-auto h-24 w-24 text-primary drop-shadow-lg" />
                        <h1 className="mt-4 text-5xl md:text-7xl font-headline text-primary drop-shadow-md">Go Swami Defence Academy</h1>
                        <p className="mt-4 text-2xl md:text-3xl font-signature text-foreground drop-shadow-sm">राष्ट्र प्रथम, शिक्षा सर्वोपरि</p>
                    </div>
                </>
            )}
        </div>
    );
}
