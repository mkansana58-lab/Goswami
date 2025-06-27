
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { testsData, type Question, type TestDetails } from '@/lib/tests-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Answers = { [key: number]: string };

export default function TestPlayerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;

  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    if (testId && testsData[testId]) {
      const data = testsData[testId];
      setTestDetails(data);
      const questions = data.subjects.flatMap(s => s.questions);
      setAllQuestions(questions);

      const savedProgress = localStorage.getItem(`test-progress-${testId}`);
      if (savedProgress) {
        const { savedAnswers, savedIndex, savedTimeLeft } = JSON.parse(savedProgress);
        setAnswers(savedAnswers);
        setCurrentQuestionIndex(savedIndex);
        setTimeLeft(savedTimeLeft);
      } else {
        setTimeLeft(data.timeLimit * 60);
      }
    }
  }, [testId]);

  const handleSubmit = useCallback(() => {
    localStorage.setItem(`test-result-${testId}`, JSON.stringify({ answers, timeLeft }));
    localStorage.removeItem(`test-progress-${testId}`);
    toast({ title: t('testSubmitted') });
    router.push(`/tests/${testId}/results`);
  }, [answers, timeLeft, testId, router, t, toast]);

  useEffect(() => {
    if (!isClient || !testDetails) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const saveInterval = setInterval(() => {
      localStorage.setItem(`test-progress-${testId}`, JSON.stringify({
        savedAnswers: answers,
        savedIndex: currentQuestionIndex,
        savedTimeLeft: timeLeft,
      }));
    }, 5000);

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(saveInterval);
    };
  }, [isClient, timeLeft, testDetails, answers, currentQuestionIndex, testId, handleSubmit]);


  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!isClient || !testDetails) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
             <CardTitle>{t('testInProgress')}: {t(testDetails.title)}</CardTitle>
             <div className="flex items-center gap-2 font-mono text-lg bg-primary text-primary-foreground px-3 py-1 rounded-md">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeLeft)}</span>
             </div>
          </div>
          <div className="pt-4">
            <Progress value={progressPercentage} />
            <p className="text-sm text-muted-foreground mt-2 text-center">{t('question')} {currentQuestionIndex + 1} / {allQuestions.length}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
            {currentQuestion && (
                <div className="space-y-4">
                    <p className="font-semibold text-lg">{currentQuestion.question}</p>
                    <RadioGroup
                        value={answers[currentQuestionIndex] || ''}
                        onValueChange={handleAnswerSelect}
                        className="space-y-2"
                    >
                        {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
                            <RadioGroupItem value={option} id={`option-${currentQuestionIndex}-${index}`} />
                            <Label htmlFor={`option-${currentQuestionIndex}-${index}`} className="w-full cursor-pointer">{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
                {t('previous')}
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('submitTest')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmSubmission')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('confirmSubmissionDesc')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>{t('submit')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={goToNext} disabled={currentQuestionIndex === allQuestions.length - 1}>
                {t('next')}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
