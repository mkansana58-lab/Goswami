
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Gem, BadgeCheck, Loader2, PlayCircle, RadioTower } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const COURSES_COLLECTION = 'courses';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'free' | 'paid';
  price?: string; 
  imageUrl?: string;
  dataAiHint?: string;
  contentUrl?: string; 
  subject?: string;
  features?: string[]; 
  liveSessionDetails?: string; // New field for live session info
}

export default function PremiumCoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, COURSES_COLLECTION), 
          where("category", "==", "paid"),
          orderBy("title")
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching paid courses from Firestore:", error);
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
            <Star className="h-16 w-16 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('premiumCoursesTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('premiumCoursesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="border-accent shadow-lg hover:shadow-2xl transition-shadow flex flex-col">
                  {course.imageUrl && (
                    <div className="relative aspect-video">
                       <Image 
                          src={course.imageUrl || `https://placehold.co/600x338.png`}
                          alt={course.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover rounded-t-lg"
                          data-ai-hint={course.imageUrl ? undefined : (course.dataAiHint || "premium course")}
                          onError={(e) => e.currentTarget.src = 'https://placehold.co/600x338.png'}
                       />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      {course.title.toLowerCase().includes("sainik") ? 
                        <Gem className="h-7 w-7 text-accent" /> : 
                        <BadgeCheck className="h-7 w-7 text-accent" />}
                      <CardTitle className="text-xl text-accent">{course.title}</CardTitle>
                    </div>
                    {course.subject && <CardDescription>{t('subject')}: {course.subject}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    {course.price && <p className="text-lg font-semibold text-foreground mb-3">{course.price}</p>}
                    {course.features && course.features.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4 text-sm">
                        {course.features.map((feature, index) => <li key={index}>{feature}</li>)}
                      </ul>
                    )}
                    {course.liveSessionDetails && (
                      <div className="mt-2 p-3 bg-accent/10 rounded-md">
                        <div className="flex items-center text-accent mb-1">
                          <RadioTower className="h-5 w-5 mr-2" />
                          <h4 className="font-semibold text-sm">Live Session Details:</h4>
                        </div>
                        <p className="text-xs text-accent-foreground/80 whitespace-pre-wrap">{course.liveSessionDetails}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardContent>
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link href="/contact">{t('enrollNowButton') || 'Enroll Now / Contact Us'}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-6">{t('noPaidCoursesAvailable') || "No premium courses available at the moment."}</p>
          )}

           <Card className="bg-muted/30 mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-secondary-foreground">{t('whyGoPremium') || 'Why Go Premium?'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                {t('whyGoPremiumDesc') || "Our premium courses are designed for aspirants who seek an extra edge in their preparation. With limited seats, we ensure quality and individual attention for every premium student."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('adminManageCoursesNote') || "Admin: Please add/manage courses (free/paid) in the 'courses' collection in Firestore. Include 'liveSessionDetails' for courses with live components."}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// enrollNowButton: "Enroll Now / Contact Us" (EN/HI)
// noPaidCoursesAvailable: "No premium courses available at the moment." (EN/HI)
// whyGoPremium: "Why Go Premium?" (EN/HI)
// whyGoPremiumDesc: "Our premium courses are designed for aspirants who seek an extra edge in their preparation..." (EN/HI)
// adminManageCoursesNote (already added for free courses, can be reused)

    