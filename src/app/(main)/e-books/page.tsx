
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getEBooks, type EBook } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Library, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function EBooksPage() {
    const { t } = useLanguage();
    const [ebooks, setEbooks] = useState<EBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getEBooks()
            .then(setEbooks)
            .catch(err => console.error("Failed to fetch e-books:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Library className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('ebooks')}</h1>
                <p className="text-muted-foreground">Access our digital library.</p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : ebooks.length === 0 ? (
                 <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No e-books available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ebooks.map(book => (
                        <Card key={book.id} className="flex flex-col">
                             {book.imageUrl && (
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-muted">
                                    <Image 
                                        src={book.imageUrl} 
                                        alt={book.title} 
                                        width={300} 
                                        height={400} 
                                        className="object-cover w-full h-full"
                                        data-ai-hint="book cover" 
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{book.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow"></CardContent>
                             <CardFooter>
                                <Button asChild className="w-full">
                                    <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Read Now
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
