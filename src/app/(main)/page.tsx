
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import {
  FileSignature,
  Library,
  MessageCircle,
  Bot,
  FlaskConical,
  TrendingUp,
  Star,
  Users,
  Mail,
  Settings,
} from 'lucide-react';

const featureGridLinks = [
  { href: '/scholarship', labelKey: 'scholarshipForm', icon: FileSignature },
  { href: '/learning-hub', labelKey: 'navLearningHub', icon: Library },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: MessageCircle },
  { href: '/chat', labelKey: 'aiChat', icon: Bot },
  { href: '/tests', labelKey: 'aiTest', icon: FlaskConical },
  { href: '/cutoff-checker', labelKey: 'navCutOffChecker', icon: TrendingUp },
  { href: '/toppers', labelKey: 'toppers', icon: Star },
  { href: '/our-teachers', labelKey: 'ourTeachers', icon: Users },
  { href: '/contact', labelKey: 'navContact', icon: Mail },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start gap-4 text-white">
        <Image src="/logo.png" alt="Goswami Defence Academy Logo" width={60} height={60} />
        <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('appName')}</h1>
      </div>

      <Card className="w-full shadow-lg bg-card text-card-foreground">
        <CardContent className="p-6 text-center">
          <p className="font-semibold text-xl md:text-2xl text-card-foreground">
            "{t('inspiringQuoteTitle')}"
          </p>
        </CardContent>
      </Card>

      <section>
        <div className="grid grid-cols-4 gap-4">
          {featureGridLinks.map((link) => (
            <Link href={link.href} key={link.href} passHref>
              <Card className="bg-card text-card-foreground hover:bg-muted/50 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center p-3 shadow-md aspect-square">
                <link.icon className="h-8 w-8 text-primary mb-2" />
                <span className="text-xs md:text-sm font-medium leading-tight">{t(link.labelKey as any)}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
