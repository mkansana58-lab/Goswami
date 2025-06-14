
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quizzes = [
  { id: 'qz001', title: 'गणित अभ्यास क्विज़', subject: 'गणित', questions: 10 },
  { id: 'qz002', title: 'इतिहास ज्ञान परीक्षा', subject: 'सामान्य ज्ञान', questions: 15 },
  { id: 'qz003', title: 'अंग्रेजी शब्दावली टेस्ट', subject: 'अंग्रेजी', questions: 20 },
];

export default function QuizPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navQuiz')}</CardTitle>
          <CardDescription className="text-lg">{t('quizDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-foreground">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground">{t('subject')}: {quiz.subject} | {t('questions') || 'Questions'}: {quiz.questions}</p>
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">{t('startQuiz') || 'Start Quiz'}</Button>
              </div>
            </Card>
          ))}
           <p className="text-center text-sm text-muted-foreground pt-4">
            यह पेज आपको विभिन्न विषयों पर क्विज़ प्रदान करेगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add 'questions' and 'startQuiz' to translations if needed.
