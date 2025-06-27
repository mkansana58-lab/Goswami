
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getCourses, type Course } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, BookOpenCheck } from 'lucide-react';
import Image from 'next/image';

export default function CoursesPage() {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCourses()
            .then(setCourses)
            .catch(err => console.error("Failed to fetch courses:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <BookOpenCheck className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('ourCourses')}</h1>
                <p className="text-muted-foreground">Explore our available courses.</p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : courses.length === 0 ? (
                 <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No courses available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <Card key={course.id} className="flex flex-col">
                             {course.imageUrl && (
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                    <Image 
                                        src={course.imageUrl} 
                                        alt={course.title} 
                                        width={400} 
                                        height={200} 
                                        className="object-cover w-full h-full"
                                        data-ai-hint="course" 
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{course.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
