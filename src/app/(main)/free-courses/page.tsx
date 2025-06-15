
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Loader2, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // For Learn More button

const COURSES_COLLECTION = 'courses';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'free' | 'paid';
  imageUrl?: string;
  dataAiHint?: string;
  contentUrl?: string; // Link to course content/details page or external resource
  subject?: string;
}

export default function FreeCoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, COURSES_COLLECTION), 
          where("category", "==", "free"),
          orderBy("title")
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching free courses from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navFreeCourses')}</CardTitle>
          <CardDescription className="text-lg">{t('freeCoursesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  <div className="relative aspect-video">
                     <Image 
                        src={course.imageUrl || `https://placehold.co/600x338.png`}
                        alt={course.title}
                        width={600}
                        height={338}
                        className="w-full h-full object-cover"
                        data-ai-hint={course.imageUrl ? undefined : (course.dataAiHint || "online course")}
                        onError={(e) => e.currentTarget.src = 'https://placehold.co/600x338.png'}
                     />
                     {course.contentUrl && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <PlayCircle className="h-16 w-16 text-white" />
                        </div>
                     )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-secondary-foreground">{course.title}</CardTitle>
                    {course.subject && <CardDescription>{t('subject')}: {course.subject}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  </CardContent>
                  <CardContent>
                    {course.contentUrl ? (
                      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <a href={course.contentUrl} target="_blank" rel="noopener noreferrer">
                          {t('startLearning') || 'Start Learning'}
                        </a>
                      </Button>
                    ) : (
                       <Button className="w-full" disabled>{t('comingSoon') || 'Coming Soon'}</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('noFreeCoursesAvailable') || "No free courses available at the moment."}</p>
          )}
           <p className="text-center text-sm text-muted-foreground pt-6">
             {t('adminManageCoursesNote') || "Admin: Please add/manage courses (free/paid) in the 'courses' collection in Firestore."}
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// startLearning: "Start Learning" (EN/HI)
// comingSoon: "Coming Soon" (EN/HI)
// noFreeCoursesAvailable: "No free courses available at the moment." (EN/HI)
// adminManageCoursesNote: "Admin: Please add/manage courses (free/paid) in the 'courses' collection in Firestore." (EN/HI)
