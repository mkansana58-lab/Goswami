
"use client";

import Link from 'next/link';
import { InspirationalMessages } from '@/components/home/inspirational-messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { BookText, ClipboardCheck, PlaySquare, Users, Cpu, ShieldCheck, GraduationCap, Star } from 'lucide-react';
import Image from 'next/image';

const featureLinks = [
  { href: '/schedule', labelKey: 'navSchedule', icon: BookText, descriptionKey: 'Access daily class schedules and homework.' },
  { href: '/tests', labelKey: 'navTests', icon: ClipboardCheck, descriptionKey: 'Find mock tests and previous year papers.' },
  { href: '/videos', labelKey: 'navVideos', icon: PlaySquare, descriptionKey: 'Watch video lectures for various subjects.' },
  { href: '/scholarship', labelKey: 'navScholarship', icon: Users, descriptionKey: 'Register for our scholarship exams.' },
  { href: '/sainik-school-course', labelKey: 'navSainikSchoolCourse', icon: GraduationCap, descriptionKey: 'sainikSchoolCourseDesc' },
  { href: '/military-school-course', labelKey: 'navMilitarySchoolCourse', icon: GraduationCap, descriptionKey: 'militarySchoolCourseDesc' },
  { href: '/premium-courses', labelKey: 'navPremiumCourses', icon: Star, descriptionKey: 'premiumCoursesDesc' },
  { href: '/ai-tutor', labelKey: 'navAITutor', icon: Cpu, descriptionKey: 'Get AI help with problem difficulty.' },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-card rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <ShieldCheck className="h-24 w-24 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8">
            {t('heroSubtitle')}
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
            <Link href="/scholarship">{t('navScholarship')}</Link>
          </Button>
        </div>
      </section>

      {/* Explore Sections */}
      <section>
        <h2 className="text-3xl font-bold font-headline text-center text-primary mb-8">
          {t('exploreSections')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureLinks.map((link) => (
            <Link href={link.href} key={link.href} passHref>
              <Card className="hover:shadow-2xl hover:border-accent transition-all duration-300 cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <link.icon className="h-10 w-10 text-accent" />
                  <CardTitle className="text-xl font-headline text-primary">{t(link.labelKey as any)}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{t(link.descriptionKey as any) || link.descriptionKey}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Placeholder image section */}
      <section className="py-8">
        <Card className="overflow-hidden shadow-lg rounded-lg">
          <Image 
            src="https://placehold.co/1200x400.png" 
            alt="Defence academy students" 
            width={1200} 
            height={400} 
            className="w-full h-auto object-cover"
            data-ai-hint="military students" 
          />
        </Card>
      </section>

      {/* Inspirational Messages */}
      <InspirationalMessages />
    </div>
  );
}
