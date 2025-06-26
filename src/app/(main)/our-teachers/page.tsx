
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Image from 'next/image';

const teachersData = [
  { id: 1, name: 'Mr. R. K. Sharma', subject: 'Mathematics', experience: '15+ Years', imageUrl: 'https://placehold.co/150x150.png', dataAiHint: 'male teacher' },
  { id: 2, name: 'Mrs. Sunita Verma', subject: 'General Science', experience: '12+ Years', imageUrl: 'https://placehold.co/150x150.png', dataAiHint: 'female teacher' },
  { id: 3, name: 'Mr. Anil Kumar', subject: 'English & Reasoning', experience: '10+ Years', imageUrl: 'https://placehold.co/150x150.png', dataAiHint: 'male teacher' },
  { id: 4, name: 'Sgt. (Retd.) Balwan Singh', subject: 'Physical Training & Discipline', experience: '20+ Years (Indian Army)', imageUrl: 'https://placehold.co/150x150.png', dataAiHint: 'army officer' },
];

export default function OurTeachersPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl bg-card text-card-foreground">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">{t('ourTeachers')}</CardTitle>
          <CardDescription className="text-lg">Meet our experienced and dedicated faculty.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teachersData.map((teacher) => (
                <Card key={teacher.id} className="p-4 flex flex-col items-center text-center shadow-md bg-background/50">
                    <Image 
                        src={teacher.imageUrl}
                        alt={teacher.name}
                        width={100}
                        height={100}
                        className="rounded-full border-4 border-primary object-cover mb-4"
                        data-ai-hint={teacher.dataAiHint}
                    />
                    <h3 className="text-xl font-bold font-headline">{teacher.name}</h3>
                    <p className="text-primary font-semibold">{teacher.subject}</p>
                    <p className="text-muted-foreground text-sm">{teacher.experience}</p>
                </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
