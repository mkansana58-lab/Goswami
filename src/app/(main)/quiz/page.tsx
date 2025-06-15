
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const QUIZZES_COLLECTION = 'quizzes';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  // link?: string; // Optional: Link to an external quiz platform or internal quiz page
}

export default function QuizPage() {
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, QUIZZES_COLLECTION), orderBy("subject"), orderBy("title"));
        const querySnapshot = await getDocs(q);
        const fetchedQuizzes: Quiz[] = [];
        querySnapshot.forEach((doc) => {
          fetchedQuizzes.push({ id: doc.id, ...doc.data() } as Quiz);
        });
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

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
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-foreground">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('subject')}: {quiz.subject} | {t('questions') || 'Questions'}: {quiz.questionsCount}
                    </p>
                  </div>
                  {/* TODO: Implement actual quiz start functionality or link */}
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled> 
                    {t('startQuiz') || 'Start Quiz'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('noQuizzesAvailable') || "No quizzes available at the moment."}</p>
          )}
           <p className="text-center text-sm text-muted-foreground pt-4">
            {t('adminManageQuizzesNote') || "Admin: Please add/manage quizzes in the 'quizzes' collection in Firestore."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// noQuizzesAvailable: "No quizzes available at the moment." (EN/HI)
// adminManageQuizzesNote: "Admin: Please add/manage quizzes in the 'quizzes' collection in Firestore." (EN/HI)
