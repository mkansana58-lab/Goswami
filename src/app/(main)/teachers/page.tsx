
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getTeachers, getGalleryImages, type Teacher, type GalleryImage } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, UserSquare, Camera } from 'lucide-react';
import Image from 'next/image';

export default function TeachersPage() {
    const { t } = useLanguage();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([getTeachers(), getGalleryImages()])
            .then(([teachersData, galleryData]) => {
                setTeachers(teachersData);
                setGalleryImages(galleryData);
            })
            .catch(err => console.error("Failed to fetch page data:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-12">
            <section>
                <div className="flex flex-col items-center text-center">
                    <UserSquare className="h-12 w-12 text-primary" />
                    <h1 className="text-3xl font-bold text-primary mt-2">{t('teachers')}</h1>
                    <p className="text-muted-foreground">Meet our experienced faculty.</p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : teachers.length === 0 ? (
                     <Card className="mt-6">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            <p>{t('comingSoon') || 'Teacher information will be updated soon.'}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {teachers.map(teacher => (
                            <Card key={teacher.id} className="flex flex-col text-center items-center p-6">
                                 {teacher.imageUrl && (
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
                                        <Image 
                                            src={teacher.imageUrl} 
                                            alt={teacher.name} 
                                            width={128} 
                                            height={128}
                                            className="object-cover w-full h-full"
                                            data-ai-hint="teacher photo" 
                                        />
                                    </div>
                                )}
                                <CardHeader className="p-0">
                                    <CardTitle>{teacher.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 mt-2 flex-grow">
                                    <CardDescription>{teacher.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex flex-col items-center text-center">
                    <Camera className="h-12 w-12 text-primary" />
                    <h1 className="text-3xl font-bold text-primary mt-2">Coaching Gallery</h1>
                    <p className="text-muted-foreground">A glimpse into our academy life.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : galleryImages.length === 0 ? (
                     <Card className="mt-6">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                             <p>{t('comingSoon') || 'Gallery images will be added soon.'}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {galleryImages.map(image => (
                            <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.caption}
                                    width={400}
                                    height={400}
                                    className="w-full h-auto object-contain bg-muted transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="coaching students"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                    <p className="text-white text-center text-sm">{image.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
