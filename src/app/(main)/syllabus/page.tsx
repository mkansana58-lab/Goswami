
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const SYLLABUS_COLLECTION = 'syllabusItems'; // Firestore collection name

interface SyllabusSubject {
  name: string;
  topics: string[];
}
interface SyllabusItem {
  id: string;
  courseKey: string; // This will be the actual course name string now
  subjects: SyllabusSubject[];
  order?: number; // Optional field for ordering
}

export default function SyllabusPage() {
  const { t } = useLanguage();
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, SYLLABUS_COLLECTION), orderBy("order", "asc"), orderBy("courseKey", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedItems: SyllabusItem[] = [];
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() } as SyllabusItem);
        });
        setSyllabusItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching syllabus from Firestore:", error);
        // Optionally set an error state to display to the user
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <ListChecks className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navSyllabus')}</CardTitle>
          <CardDescription className="text-lg">{t('syllabusDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : syllabusItems.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {syllabusItems.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                  <AccordionTrigger className="text-xl font-semibold text-secondary-foreground hover:text-primary">
                    {/* If courseKey is a translation key, use t(item.courseKey as any). Otherwise, display directly. */}
                    {t(item.courseKey as any) || item.courseKey} 
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.subjects.map((subject, index) => (
                      <div key={`${item.id}-subject-${index}`} className="mb-3 pl-4">
                        <h4 className="font-medium text-primary/90 text-lg">{subject.name}</h4>
                        <ul className="list-disc list-inside ml-4 text-muted-foreground text-sm space-y-1">
                          {subject.topics.map((topic, topicIndex) => <li key={`${item.id}-topic-${topicIndex}`}>{topic}</li>)}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('noSyllabusAvailable') || "No syllabus information available at the moment."}</p>
          )}
           <p className="text-center text-sm text-muted-foreground pt-6">
             {t('adminManageSyllabusNote') || "Admin: Please add/manage syllabus items in the 'syllabusItems' collection in Firestore."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// noSyllabusAvailable: "No syllabus information available at the moment." (EN/HI)
// adminManageSyllabusNote: "Admin: Please add/manage syllabus items in the 'syllabusItems' collection in Firestore." (EN/HI)
// Also ensure courseKey values used in Firestore (e.g., "Sainik School Entrance", "RMS Entrance") are either direct display strings or have corresponding translation keys.
