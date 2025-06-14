
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';

const books = [
  { id: 'bk001', title: 'एनडीए/एनए परीक्षा गाइड', author: 'आर.एस. अग्रवाल', imgHint: 'math book', dataAiHint: "math book" },
  { id: 'bk002', title: 'सामान्य ज्ञान दिग्दर्शन', author: 'लुसेंट', imgHint: 'gk book', dataAiHint: "gk book" },
  { id: 'bk003', title: 'वस्तुनिष्ठ सामान्य अंग्रेजी', author: 'एस.पी. बख्शी', imgHint: 'english book', dataAiHint: "english book" },
];

export default function StudyBooksPage() {
  const { t } = useLanguage();

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
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <Image 
                src={`https://placehold.co/300x400.png`}
                alt={book.title}
                width={300}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={book.dataAiHint}
              />
              <div className="p-4">
                <h3 className="text-md font-semibold text-secondary-foreground">{book.title}</h3>
                <p className="text-xs text-muted-foreground">{t('author') || 'Author'}: {book.author}</p>
              </div>
            </Card>
          ))}
        </CardContent>
         <CardContent>
           <p className="text-center text-sm text-muted-foreground pt-4">
            यह पेज आपको अध्ययन के लिए महत्वपूर्ण पुस्तकें दिखाएगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add 'author' to translations if needed.
