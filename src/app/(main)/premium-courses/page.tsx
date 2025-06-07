
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Gem, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PremiumCoursesPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Star className="h-16 w-16 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('premiumCoursesTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('premiumCoursesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-accent shadow-lg hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Gem className="h-8 w-8 text-accent" />
                  <CardTitle className="text-2xl text-accent">{t('sainikSchoolCourseTitle')}</CardTitle>
                </div>
                <CardDescription>Unlock advanced strategies and one-on-one mentorship.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-foreground mb-3">{t('premiumSainikPrice')}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                  <li>Personalized study plans</li>
                  <li>Exclusive weekly live sessions</li>
                  <li>Advanced problem-solving workshops</li>
                  <li>Direct access to senior faculty</li>
                </ul>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/contact">Enroll Now</Link> {/* Assuming a contact page or specific enrollment link */}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent shadow-lg hover:shadow-2xl transition-shadow">
              <CardHeader>
                 <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="h-8 w-8 text-accent" />
                  <CardTitle className="text-2xl text-accent">{t('militarySchoolCourseTitle')}</CardTitle>
                </div>
                <CardDescription>Intensive preparation with focused support for RMS.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-foreground mb-3">{t('premiumMilitaryPrice')}</p>
                 <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                  <li>Targeted RMS curriculum</li>
                  <li>Mock interview sessions</li>
                  <li>Performance tracking and feedback</li>
                  <li>Small, dedicated premium batches</li>
                </ul>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                   <Link href="/contact">Enroll Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

           <Card className="bg-muted/30 mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-secondary-foreground">Why Go Premium?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                Our premium courses are designed for aspirants who seek an extra edge in their preparation. With limited seats, we ensure quality and individual attention for every premium student.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Note: Payment processing is not implemented in this prototype. This page demonstrates the course structure.
              </p>
            </CardContent>
          </Card>


        </CardContent>
      </Card>
    </div>
  );
}
