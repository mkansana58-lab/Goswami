
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Library, Gift, Star, GraduationCap, ShieldCheck, BookOpen as BookOpenIcon, PlayCircle, RadioTower, Loader2, Users } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
  liveSessionDetails?: string;
}

export default function StudyMaterialHubPage() {
  const { t } = useLanguage();
  const [freeCourses, setFreeCourses] = useState<Course[]>([]);
  const [paidCourses, setPaidCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const freeQuery = query(
          collection(db, COURSES_COLLECTION),
          where("category", "==", "free"),
          orderBy("title")
        );
        const paidQuery = query(
          collection(db, COURSES_COLLECTION),
          where("category", "==", "paid"),
          orderBy("title")
        );

        const [freeSnapshot, paidSnapshot] = await Promise.all([
          getDocs(freeQuery),
          getDocs(paidQuery)
        ]);

        const fetchedFreeCourses: Course[] = [];
        freeSnapshot.forEach((doc) => {
          fetchedFreeCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        setFreeCourses(fetchedFreeCourses);

        const fetchedPaidCourses: Course[] = [];
        paidSnapshot.forEach((doc) => {
          fetchedPaidCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        setPaidCourses(fetchedPaidCourses);

      } catch (error) {
        console.error("Error fetching courses from Firestore:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchAllCourses();
  }, []);

  const renderCourseCard = (course: Course) => (
    <Card key={course.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      <div className="relative aspect-video">
        <Image
          src={course.imageUrl || `https://placehold.co/600x338.png`}
          alt={course.title}
          width={600}
          height={338}
          className="w-full h-full object-cover"
          data-ai-hint={course.imageUrl ? undefined : (course.dataAiHint || (course.category === 'free' ? "online course" : "premium course"))}
          onError={(e) => e.currentTarget.src = 'https://placehold.co/600x338.png'}
        />
        {course.contentUrl && course.category === 'free' && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className={`text-xl ${course.category === 'paid' ? 'text-accent' : 'text-secondary-foreground'}`}>{course.title}</CardTitle>
        {course.subject && <CardDescription>{t('subject')}: {course.subject}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
        {course.category === 'paid' && course.price && <p className="text-lg font-semibold text-foreground mb-3">{course.price}</p>}
        {course.category === 'paid' && course.features && course.features.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4 text-sm">
            {course.features.map((feature, index) => <li key={index}>{feature}</li>)}
          </ul>
        )}
        {course.liveSessionDetails && (
          <div className={`mt-2 p-3 ${course.category === 'paid' ? 'bg-accent/10' : 'bg-primary/10'} rounded-md`}>
            <div className={`flex items-center ${course.category === 'paid' ? 'text-accent' : 'text-primary'} mb-1`}>
              <RadioTower className="h-5 w-5 mr-2" />
              <h4 className="font-semibold text-sm">Live Session Details:</h4>
            </div>
            <p className={`text-xs ${course.category === 'paid' ? 'text-accent-foreground/80' : 'text-primary/80'} whitespace-pre-wrap`}>{course.liveSessionDetails}</p>
          </div>
        )}
      </CardContent>
      <CardContent>
        {course.category === 'free' ? (
          course.contentUrl ? (
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={course.contentUrl} target="_blank" rel="noopener noreferrer">
                {t('startLearning') || 'Start Learning'}
              </a>
            </Button>
          ) : (
            <Button className="w-full" disabled>{t('comingSoon') || 'Coming Soon'}</Button>
          )
        ) : ( // Paid course
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/contact">{t('enrollNowButton') || 'Enroll Now / Contact Us'}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Library className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navStudyMaterial')}</CardTitle>
          <CardDescription className="text-lg">{t('studyMaterialHubDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" className="w-full space-y-4">
            {/* Free Courses Section */}
            <AccordionItem value="free-courses">
              <AccordionTrigger className="text-2xl font-semibold text-primary hover:text-primary/80 bg-muted/50 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-7 w-7 text-accent" /> {t('studyMaterialCategoryFreeCourses')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
                ) : freeCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">{freeCourses.map(renderCourseCard)}</div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">{t('noFreeCoursesAvailable')}</p>
                )}
                <p className="text-center text-xs text-muted-foreground pt-4">{t('adminManageCoursesNote')}</p>
              </AccordionContent>
            </AccordionItem>

            {/* Premium Courses Section */}
            <AccordionItem value="premium-courses">
              <AccordionTrigger className="text-2xl font-semibold text-primary hover:text-primary/80 bg-muted/50 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-7 w-7 text-accent" /> {t('studyMaterialCategoryPremiumCourses')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">{t('loading')}</p></div>
                ) : paidCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">{paidCourses.map(renderCourseCard)}</div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">{t('noPaidCoursesAvailable')}</p>
                )}
                <Card className="bg-muted/30 mt-6">
                  <CardHeader><CardTitle className="text-xl text-secondary-foreground">{t('whyGoPremium')}</CardTitle></CardHeader>
                  <CardContent><p className="text-foreground">{t('whyGoPremiumDesc')}</p></CardContent>
                </Card>
                <p className="text-center text-xs text-muted-foreground pt-4">{t('adminManageCoursesNote')}</p>
              </AccordionContent>
            </AccordionItem>

            {/* Sainik School Course Material Section */}
            <AccordionItem value="sainik-school">
              <AccordionTrigger className="text-2xl font-semibold text-primary hover:text-primary/80 bg-muted/50 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-7 w-7 text-accent" /> {t('studyMaterialCategorySainik')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-lg space-y-6">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <Image src="https://placehold.co/800x300.png" alt={t('sainikSchoolCourseTitle')} width={800} height={300} className="w-full h-auto object-cover" data-ai-hint="students studying" />
                </div>
                <Card className="bg-muted/30">
                  <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><BookOpenIcon className="mr-2 h-6 w-6 text-accent"/> Course Highlights</CardTitle></CardHeader>
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
                  <CardHeader><CardTitle className="text-xl text-accent">Enrollment Details</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-accent-foreground">Contact us for batch timings, fee structure, and enrollment process.</p>
                    <p className="mt-2"><strong>{t('phoneNumber')}:</strong> +91-XXXXXXXXXX</p>
                    <p><strong>{t('emailAddress')}:</strong> info@goswamidefence.com</p>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Military School Course Material Section */}
            <AccordionItem value="military-school">
              <AccordionTrigger className="text-2xl font-semibold text-primary hover:text-primary/80 bg-muted/50 px-4 py-3 rounded-t-lg">
                 <div className="flex items-center gap-2">
                  <ShieldCheck className="h-7 w-7 text-accent" /> {t('studyMaterialCategoryMilitary')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-lg space-y-6">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <Image src="https://placehold.co/800x300.png" alt={t('militarySchoolCourseTitle')} width={800} height={300} className="w-full h-auto object-cover" data-ai-hint="military parade" />
                </div>
                <Card className="bg-muted/30">
                  <CardHeader><CardTitle className="text-xl text-secondary-foreground flex items-center"><Users className="mr-2 h-6 w-6 text-accent"/> Why Choose Us for RMS?</CardTitle></CardHeader>
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
                  <CardHeader><CardTitle className="text-xl text-primary">Admission Process</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-primary-foreground/90">Get in touch to learn about our admission criteria and upcoming batches for RMS coaching.</p>
                    <p className="mt-2"><strong>{t('phoneNumber')}:</strong> +91-YYYYYYYYYY</p>
                    <p><strong>{t('emailAddress')}:</strong> admissions@goswamidefence.com</p>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            {/* Add more accordion items for other study material categories as needed */}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
