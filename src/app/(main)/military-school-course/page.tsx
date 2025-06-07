
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users } from 'lucide-react';
import Image from 'next/image';

export default function MilitarySchoolCoursePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('militarySchoolCourseTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('militarySchoolCourseDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="overflow-hidden rounded-lg shadow-md">
            <Image
              src="https://placehold.co/800x400.png"
              alt={t('militarySchoolCourseTitle')}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="military parade"
            />
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl text-secondary-foreground flex items-center">
                <Users className="mr-2 h-6 w-6 text-accent"/> Why Choose Us for RMS?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Specialized curriculum for Rashtriya Military Schools (RMS).</li>
                <li>Focus on developing leadership and discipline.</li>
                <li>Extensive practice with previous year papers.</li>
                <li>Small batch sizes for individual focus.</li>
                <li>Holistic development including co-curricular activities.</li>
                <li>Guidance from ex-defense personnel.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary">
             <CardHeader>
                <CardTitle className="text-xl text-primary">Admission Process</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-primary-foreground/90">Get in touch to learn about our admission criteria and upcoming batches for RMS coaching.</p>
                 <p className="mt-2"><strong>{t('phoneNumber')}:</strong> +91-YYYYYYYYYY</p>
                <p><strong>{t('emailAddress')}:</strong> admissions@goswamidefence.com</p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
