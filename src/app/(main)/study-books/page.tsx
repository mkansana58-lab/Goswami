
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const BOOKS_COLLECTION = 'studyBooks';

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  imageUrl?: string;
  dataAiHint?: string; // For placeholder if imageUrl is missing
  purchaseLink?: string;
}

export default function StudyBooksPage() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, BOOKS_COLLECTION), orderBy("title"));
        const querySnapshot = await getDocs(q);
        const fetchedBooks: Book[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBooks.push({ id: doc.id, ...doc.data() } as Book);
        });
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Error fetching study books from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navStudyBooks')}</CardTitle>
          <CardDescription className="text-lg">{t('studyBooksDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  <Image 
                    src={book.imageUrl || `https://placehold.co/300x400.png`}
                    alt={book.title}
                    width={300}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={book.imageUrl ? undefined : (book.dataAiHint || "book cover")}
                    onError={(e) => e.currentTarget.src = 'https://placehold.co/300x400.png'}
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-md font-semibold text-secondary-foreground">{book.title}</h3>
                    <p className="text-xs text-muted-foreground">{t('author') || 'Author'}: {book.author}</p>
                    {book.description && <p className="text-xs text-muted-foreground mt-1 flex-grow">{book.description}</p>}
                    {book.purchaseLink && (
                      <a 
                        href={book.purchaseLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-sm text-primary hover:underline"
                      >
                        {t('buyNow') || 'Buy Now'}
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-6">{t('noBooksAvailable') || "No study books listed at the moment."}</p>
          )}
           <p className="text-center text-sm text-muted-foreground pt-6">
             {t('adminManageBooksNote') || "Admin: Please add/manage books in the 'studyBooks' collection in Firestore."}
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// buyNow: "Buy Now" (EN/HI)
// noBooksAvailable: "No study books listed at the moment." (EN/HI)
// adminManageBooksNote: "Admin: Please add/manage books in the 'studyBooks' collection in Firestore." (EN/HI)
