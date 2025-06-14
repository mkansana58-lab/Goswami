
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const syllabusItems = [
  { 
    id: 'sy001', 
    courseKey: 'navSainikSchoolCourse', 
    subjects: [
      { name: 'गणित', topics: ['संख्या पद्धति', 'बीजगणित', 'ज्यामिति', 'त्रिकोणमिति'] },
      { name: 'अंग्रेजी', topics: ['व्याकरण', 'शब्दावली', 'समझ'] },
      { name: 'सामान्य ज्ञान', topics: ['इतिहास', 'भूगोल', 'विज्ञान'] },
    ]
  },
  { 
    id: 'sy002', 
    courseKey: 'navMilitarySchoolCourse', 
    subjects: [
      { name: 'गणित', topics: ['अंकगणित', 'बीजगणित', 'क्षेत्रमिति'] },
      { name: 'इंटेलिजेंस टेस्ट', topics: ['वर्बल रीजनिंग', 'नॉन-वर्बल रीजनिंग'] },
      { name: 'अंग्रेजी', topics: ['ग्रामर', 'वोकैबुलरी', 'कंप्रिहेंशन'] },
    ]
  },
];

export default function SyllabusPage() {
  const { t } = useLanguage();

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
          <Accordion type="single" collapsible className="w-full">
            {syllabusItems.map((item) => (
              <AccordionItem value={item.id} key={item.id}>
                <AccordionTrigger className="text-xl font-semibold text-secondary-foreground hover:text-primary">
                  {t(item.courseKey as any)}
                </AccordionTrigger>
                <AccordionContent>
                  {item.subjects.map(subject => (
                    <div key={subject.name} className="mb-3 pl-4">
                      <h4 className="font-medium text-primary/90 text-lg">{subject.name}</h4>
                      <ul className="list-disc list-inside ml-4 text-muted-foreground text-sm space-y-1">
                        {subject.topics.map(topic => <li key={topic}>{topic}</li>)}
                      </ul>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
           <p className="text-center text-sm text-muted-foreground pt-6">
            यह पेज आपको विभिन्न कोर्स के लिए विस्तृत सिलेबस दिखाएगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
