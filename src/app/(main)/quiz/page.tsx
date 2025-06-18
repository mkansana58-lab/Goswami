
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; // Added import for Label
import { generateQuizForUser } from './actions';
import type { GenerateQuizOutput, QuizQuestion } from '@/ai/flows/generate-quiz-flow';
import { Loader2, FileQuestion, Award, CheckCircle, XCircle, History } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const userDetailsFormSchemaDefinition = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('studentNameValidation') }),
  mobile: z.string().min(10, { message: t('phoneValidation') }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') }),
  selectedClass: z.string({ required_error: t('quizClassValidation') }).min(1, {message: t('quizClassValidation')}),
});
type UserDetailsFormValues = z.infer<ReturnType<typeof userDetailsFormSchemaDefinition>>;

type QuizStage = 'details' | 'loadingQuiz' | 'inProgress' | 'completed';

const classLevels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

export default function AIQuizPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [quizStage, setQuizStage] = useState<QuizStage>('details');
  const [userDetails, setUserDetails] = useState<UserDetailsFormValues | null>(null);
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);
  const [score, setScore] = useState(0);

  const userDetailsForm = useForm<UserDetailsFormValues>({
    resolver: zodResolver(userDetailsFormSchemaDefinition(t)),
    defaultValues: { name: "", mobile: "", selectedClass: "" },
  });

  const handleDetailsSubmit: SubmitHandler<UserDetailsFormValues> = async (data) => {
    setUserDetails(data);
    setQuizStage('loadingQuiz');
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(undefined);
    setScore(0);

    const result = await generateQuizForUser({
      classLevel: data.selectedClass,
      numQuestions: 5, // Generate 5 questions per quiz session
      language: language,
      subject: t('quizSubjectGK') || "General Knowledge"
    });

    if ('error' in result || !result.questions || result.questions[0].options[1] === '-') {
      toast({
        title: t('errorOccurred'),
        description: (result as { error?: string }).error || (language === 'hi' ? 'क्विज़ उत्पन्न करने में विफल। कृपया बाद में प्रयास करें।' : 'Failed to generate quiz. Please try again later.'),
        variant: "destructive",
      });
      setQuizStage('details'); // Go back to details form on error
      setQuizData(null);
    } else {
      setQuizData(result);
      setQuizStage('inProgress');
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === undefined || !quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);

    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedOption(undefined); // Reset selection for next question

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizStage('completed');
    }
  };
  
  const handlePlayAgain = () => {
    setQuizStage('details');
    setUserDetails(null);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(undefined);
    setScore(0);
    userDetailsForm.reset();
  };

  const currentQuestionData = quizData?.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navQuiz')}</CardTitle>
          <CardDescription className="text-lg">{t('quizDescAI')}</CardDescription>
        </CardHeader>

        <CardContent>
          {quizStage === 'details' && (
            <Form {...userDetailsForm}>
              <form onSubmit={userDetailsForm.handleSubmit(handleDetailsSubmit)} className="space-y-6">
                <FormField control={userDetailsForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>{t('studentName')}</FormLabel><FormControl><Input placeholder={t('studentName')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={userDetailsForm.control} name="mobile" render={({ field }) => ( <FormItem><FormLabel>{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" placeholder={t('phoneNumber')} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={userDetailsForm.control} name="selectedClass" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quizSelectClass')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t('quizSelectClassPlaceholder')} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {classLevels.map(level => <SelectItem key={level} value={level}>{level} ({t(level.replace(" ","") as any) || level})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{t('startQuizButton')}</Button>
              </form>
            </Form>
          )}

          {quizStage === 'loadingQuiz' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">{t('quizGenerating')}</p>
            </div>
          )}

          {quizStage === 'inProgress' && quizData && currentQuestionData && userDetails && (
            <div className="space-y-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl text-primary">{quizData.quizTitle}</CardTitle>
                <CardDescription>{t('quizQuestion')} {currentQuestionIndex + 1} {t('quizOutOf')} {quizData.questions.length}</CardDescription>
              </CardHeader>
              <Card className="p-4 bg-muted/30">
                <p className="text-lg font-semibold text-foreground mb-4">{currentQuestionData.questionText}</p>
                <RadioGroup value={selectedOption !== undefined ? selectedOption.toString() : ""} onValueChange={(value) => setSelectedOption(parseInt(value))} className="space-y-2">
                  {currentQuestionData.options.map((option, index) => (
                    <FormItem key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-background transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <FormControl><RadioGroupItem value={index.toString()} id={`option-${index}`} /></FormControl>
                      <Label htmlFor={`option-${index}`} className="font-normal text-base cursor-pointer flex-grow">{option}</Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </Card>
               {currentQuestionData.explanation && currentQuestionIndex > 0 && userAnswers.length === currentQuestionIndex && quizData.questions[currentQuestionIndex-1].explanation && (
                <Card className="p-3 mt-2 bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700"><strong className="font-semibold">{t('quizExplanationLabel') || "Explanation for previous question"}:</strong> {quizData.questions[currentQuestionIndex-1].explanation}</p>
                </Card>
               )}
              <Button onClick={handleNextQuestion} disabled={selectedOption === undefined} className="w-full bg-primary hover:bg-primary/90">
                {currentQuestionIndex === quizData.questions.length - 1 ? t('quizFinishButton') : t('quizNextQuestion')}
              </Button>
            </div>
          )}

          {quizStage === 'completed' && userDetails && quizData && (
            <Card className="text-center p-6 border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="pb-2">
                <Award className="h-16 w-16 text-accent mx-auto mb-3" />
                <CardTitle className="text-2xl font-bold text-primary">{t('quizCertificate')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg"><strong className="font-medium text-secondary-foreground">{t('studentName')}:</strong> {userDetails.name}</p>
                <p className="text-md"><strong className="font-medium text-secondary-foreground">{t('quizSelectedClass')}:</strong> {userDetails.selectedClass}</p>
                <p className="text-md"><strong className="font-medium text-secondary-foreground">{t('quizTitleLabel')}:</strong> {quizData.quizTitle}</p>
                <p className="text-2xl font-bold text-accent">
                  {t('quizScoreLabel')} {score} / {quizData.questions.length}
                </p>
                <p className="text-sm text-muted-foreground">{t('quizDateLabel')} {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-lg italic text-primary mt-2">{t('quizWellDone')}</p>
                 <div className="mt-4 max-h-48 overflow-y-auto space-y-3 p-2 border rounded-md bg-muted/20">
                    <h4 className="text-md font-semibold text-left text-secondary-foreground">{t('quizReviewAnswers') || "Review Answers:"}</h4>
                    {quizData.questions.map((q, idx) => (
                        <div key={idx} className="text-left text-sm p-2 border-b last:border-b-0">
                            <p className="font-medium">{idx + 1}. {q.questionText}</p>
                            <p className={`${userAnswers[idx] === q.correctAnswerIndex ? 'text-green-600' : 'text-red-600'}`}>
                                {t('quizYourAnswer') || "Your Answer"}: {q.options[userAnswers[idx]]} 
                                {userAnswers[idx] === q.correctAnswerIndex ? <CheckCircle className="inline h-4 w-4 ml-1" /> : <XCircle className="inline h-4 w-4 ml-1" />}
                            </p>
                            {userAnswers[idx] !== q.correctAnswerIndex && <p className="text-green-700">{t('quizCorrectAnswer') || "Correct Answer"}: {q.options[q.correctAnswerIndex]}</p>}
                            {q.explanation && <p className="text-xs text-muted-foreground mt-1"><em>{t('quizExplanationLabel') || "Explanation"}: {q.explanation}</em></p>}
                        </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="mt-4">
                <Button onClick={handlePlayAgain} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <History className="mr-2 h-4 w-4" /> {t('quizPlayAgain')}
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
