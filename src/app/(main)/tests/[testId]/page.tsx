
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { testsData, type Question, type TestDetails } from '@/lib/tests-data';
import { generateTestQuestions } from '@/ai/flows/test-generator-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addScholarshipTestResult, addTestResult, getCustomTest, type CustomTest, type ScholarshipApplicationData } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

type Answers = { [key: number]: string };

export default function TestPlayerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { student } = useAuth();
  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;

  const [testDetails, setTestDetails] = useState<TestDetails | CustomTest | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [scholarshipApplicantData, setScholarshipApplicantData] = useState<ScholarshipApplicationData | null>(null);
  
  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;

      // Check if this is a scholarship test attempt
      if (testId === 'scholarship-test-main') {
        const applicantDataString = sessionStorage.getItem('scholarship-applicant-data');
        if (applicantDataString) {
          setScholarshipApplicantData(JSON.parse(applicantDataString));
        } else {
            toast({ variant: "destructive", title: "Invalid Entry", description: "Please enter the test via the Student Portal." });
            router.replace('/student-portal');
            return;
        }
      }

      setIsGenerating(true);
      let data: TestDetails | CustomTest | null = null;
      let isStaticTestWithGeneration = false;

      if (testsData[testId]) {
          data = testsData[testId];
          isStaticTestWithGeneration = true;
      } else {
          data = await getCustomTest(testId);
      }

      if (!data) {
        toast({ variant: "destructive", title: "Test not found" });
        router.back();
        return;
      }

      setTestDetails(data);
      const savedProgress = sessionStorage.getItem(`test-progress-${testId}`);

      if (savedProgress) {
        const { savedQuestions, savedAnswers, savedIndex, savedTimeLeft } = JSON.parse(savedProgress);
        setAllQuestions(savedQuestions);
        setAnswers(savedAnswers);
        setCurrentQuestionIndex(savedIndex);
        setTimeLeft(savedTimeLeft);
        setIsGenerating(false);
      } else if (isStaticTestWithGeneration) {
        try {
          const staticData = data as TestDetails;
          let generatedQuestions: Question[] = [];
          let questionIdCounter = 0;

          for (const subject of staticData.subjects) {
            const result = await generateTestQuestions({
              className: staticData.classForAI,
              subject: t(subject.name as any),
              questionCount: subject.questionCount,
              language: staticData.languageForAI,
            });
            const questionsWithGlobalIds = result.questions.map(q => ({ ...q, id: questionIdCounter + q.id }));
            generatedQuestions = [...generatedQuestions, ...questionsWithGlobalIds];
            questionIdCounter += subject.questionCount;
          }
          setAllQuestions(generatedQuestions);
          setTimeLeft(staticData.timeLimit * 60);
        } catch (error) {
          console.error("Error generating test:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to generate the test. Please try again." });
          router.back();
        } finally {
          setIsGenerating(false);
        }
      } else { // Is a custom test
        const customData = data as CustomTest;
        setAllQuestions(customData.questions);
        setTimeLeft(customData.timeLimit * 60);
        setIsGenerating(false);
      }
    };
    loadTest();
  }, [testId, t, router, toast]);

  const handleSubmit = useCallback(async () => {
    if (!student || !testDetails) return;
  
    // Special handling for the scholarship test
    if (testId === 'scholarship-test-main' && scholarshipApplicantData) {
      let totalCorrect = 0;
      allQuestions.forEach((q) => {
        if (answers[q.id] === q.answer) {
          totalCorrect++;
        }
      });
      const timeTaken = (testDetails.timeLimit * 60) - timeLeft;
      const percentage = (totalCorrect / testDetails.totalQuestions) * 100;

      await addScholarshipTestResult({
        applicationNumber: scholarshipApplicantData.applicationNumber,
        studentName: student.name,
        score: totalCorrect,
        totalQuestions: testDetails.totalQuestions,
        percentage: percentage,
        timeTaken: timeTaken,
        answers: answers,
        allQuestions: allQuestions,
        targetTestEnrollmentCode: scholarshipApplicantData.targetTestEnrollmentCode,
      });
      sessionStorage.removeItem(`test-progress-${testId}`);
      sessionStorage.removeItem('scholarship-applicant-data');
      router.push(`/online-scholarship-test/submitted`);
      return;
    }
  
    // Default handling for other tests
    sessionStorage.setItem(`test-result-${testId}`, JSON.stringify({ answers, timeLeft, questions: allQuestions }));
    sessionStorage.removeItem(`test-progress-${testId}`);
    toast({ title: t('testSubmitted') });
    router.push(`/tests/${testId}/results`);
  }, [answers, timeLeft, allQuestions, testId, router, t, toast, student, testDetails, scholarshipApplicantData]);

  useEffect(() => {
    if (isGenerating || !testDetails) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const saveInterval = setInterval(() => {
      sessionStorage.setItem(`test-progress-${testId}`, JSON.stringify({
        savedQuestions: allQuestions,
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
  }, [isGenerating, timeLeft, testDetails, allQuestions, answers, currentQuestionIndex, testId, handleSubmit]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
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

  if (isGenerating || !testDetails) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">{t('generatingTest')}</p>
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
             <CardTitle>{t('testInProgress')}: {t(testDetails.title as any) || testDetails.title}</CardTitle>
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
                    <p className="font-semibold text-lg">{currentQuestion.id}. {currentQuestion.question}</p>
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                        className="space-y-2"
                    >
                        {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
                            <RadioGroupItem value={option} id={`option-${currentQuestion.id}-${index}`} />
                            <Label htmlFor={`option-${currentQuestion.id}-${index}`} className="w-full cursor-pointer">{option}</Label>
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
