
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function SainikSchoolCoursePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('sainikSchoolCourseTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('sainikSchoolCourseDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-lg shadow-md">
            <Image
              src="https://placehold.co/800x400.png"
              alt={t('sainikSchoolCourseTitle')}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="students studying"
            />
          </div>
          
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl text-secondary-foreground flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-accent"/> Course Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Comprehensive coverage of all subjects: Mathematics, English, GK, Intelligence.</li>
                <li>Experienced faculty with proven track record.</li>
                <li>Regular mock tests and performance analysis.</li>
                <li>Doubt clearing sessions and personalized attention.</li>
                <li>Interview preparation guidance.</li>
                <li>Physical fitness training modules.</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-accent/10 border-accent">
             <CardHeader>
                <CardTitle className="text-xl text-accent">Enrollment Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-accent-foreground">Contact us for batch timings, fee structure, and enrollment process.</p>
                <p className="mt-2"><strong>{t('phoneNumber')}:</strong> +91-XXXXXXXXXX</p>
                <p><strong>{t('emailAddress')}:</strong> info@goswamidefence.com</p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
