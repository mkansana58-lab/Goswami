
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, Award, BookCopy, ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { STUDENT_LOGGED_IN_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import type { StudentProfileData } from '../student-profile/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// FormItem and FormControl were imported here, but they are not needed for the quiz options part.
// If they are used elsewhere (like the initial student details form), keep the import.
// For this fix, they are removed from the quiz options section.

type TestStage = "details" | "generating" | "inProgress" | "completed";

interface UserAnswer {
  subjectIndex: number;
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

const classLevels = ["Class6", "Class7", "Class8", "Class9", "Class10", "Class11", "Class12"];

export default function AIPoweredTestPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [stage, setStage] = useState<TestStage>("details");
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  
  const [testPaper, setTestPaper] = useState<TestPaper | null>(null);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      if (isLoggedIn) {
        const profileRaw = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
        if (profileRaw) {
          try {
            const profile: StudentProfileData = JSON.parse(profileRaw);
            setStudentName(profile.name || '');
            // Match stored class if it's one of the options, otherwise default
            if (profile.currentClass && classLevels.map(cl => t(cl as any)).includes(profile.currentClass)) {
              setStudentClass(profile.currentClass);
            } else if (profile.currentClass && classLevels.includes(profile.currentClass.replace(/\s+/g, ''))) {
               setStudentClass(profile.currentClass.replace(/\s+/g, ''));
            }
          } catch (e) { console.error("Error parsing student profile for test page:", e); }
        }
      }
    }
    setCurrentDate(new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA'));
  }, [language, t]);

  const handleStartTest = async () => {
    if (!studentName || !studentClass) {
      toast({ title: t('errorOccurred'), description: t('nameAndClassRequired'), variant: "destructive" });
      return;
    }
    setStage("generating");
    setUserAnswers([]);
    setShowAnswer(false);
    setSelectedOption(null);
    setScore(0);
    setCurrentSubjectIndex(0);
    setCurrentQuestionIndex(0);

    const result = await generateAIMockTest({ studentClass: t(studentClass as any) || studentClass, language });
    if ('error'in result) {
        toast({ title: t('errorOccurred'), description: result.error, variant: "destructive" });
        setStage("details");
        setTestPaper(null); // Ensure testPaper is null on error
    } else if (result.title.toLowerCase().includes("error")) { // Check for error indication from flow
        const firstQuestionText = result.subjects[0]?.questions[0]?.questionText || (language === 'hi' ? 'AI मॉडल पेपर बनाने में असमर्थ था।' : 'AI was unable to generate the model paper.');
        toast({ title: t('errorOccurred'), description: firstQuestionText, variant: "destructive" });
        setStage("details");
        setTestPaper(null);
    } else {
        setTestPaper(result);
        setStage("inProgress");
    }
  };

  const currentSubject: TestSubject | undefined = testPaper?.subjects[currentSubjectIndex];
  const currentQuestion: TestQuestion | undefined = currentSubject?.questions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    const selectedIdx = parseInt(selectedOption, 10);
    const isCorrect = selectedIdx === currentQuestion.correctAnswerIndex;
    
    setUserAnswers(prev => [...prev, {
      subjectIndex: currentSubjectIndex,
      questionIndex: currentQuestionIndex,
      selectedOptionIndex: selectedIdx,
      isCorrect
    }]);

    if (isCorrect) {
      setScore(s => s + 1);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedOption(null);

    if (currentSubject && currentQuestionIndex < currentSubject.questions.length - 1) {
      setCurrentQuestionIndex(qI => qI + 1);
    } else if (testPaper && currentSubjectIndex < testPaper.subjects.length - 1) {
      setCurrentSubjectIndex(sI => sI + 1);
      setCurrentQuestionIndex(0);
    } else {
      setStage("completed");
    }
  };
  
  const handleTryAgain = () => {
    setStage("details");
    setTestPaper(null);
    // Keep studentName and studentClass, or reset if desired
  };

  const getTotalQuestions = () => {
    return testPaper?.subjects.reduce((total, subject) => total + subject.questions.length, 0) || 0;
  };


  if (stage === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t('generatingTest')}</p>
      </div>
    );
  }

  if (stage === "completed" && testPaper) {
    const totalQuestions = getTotalQuestions();
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-primary/50 transform transition-all duration-500 scale-100">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 via-background to-primary/10 py-8">
          <Award className="h-20 w-20 text-accent mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">{t('testResultTitle')}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">{t('testCertificateDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold">{studentName}</p>
            <p className="text-sm text-muted-foreground">{t('class')}: {t(studentClass as any) || studentClass}</p>
          </div>
          <Card className="bg-muted/50 p-4">
            <CardContent className="text-center space-y-2 p-0">
              <p className="text-lg font-medium">{testPaper.title}</p>
              <p className="text-4xl font-bold text-primary">{score} / {totalQuestions}</p>
              <p className="text-lg text-accent">({percentage}%)</p>
              <p className="text-sm text-muted-foreground">{t('date')}: {currentDate}</p>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('reviewAnswers') || "Review Your Answers"}</AccordionTrigger>
              <AccordionContent>
                {testPaper.subjects.map((subject, sIdx) => (
                  <div key={sIdx} className="mb-4">
                    <h4 className="font-semibold text-lg text-secondary-foreground mb-2">{subject.subjectName}</h4>
                    {subject.questions.map((q, qIdx) => {
                      const userAnswer = userAnswers.find(ua => ua.subjectIndex === sIdx && ua.questionIndex === qIdx);
                      return (
                        <Card key={`${sIdx}-${qIdx}`} className="p-3 mb-2 border rounded-md">
                          <p className="font-medium text-sm">Q{qIdx+1}: {q.questionText}</p>
                          <p className={`text-xs ${userAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {t('yourAnswer') || "Your Answer"}: {userAnswer !== undefined ? q.options[userAnswer.selectedOptionIndex] : (t('notAttempted') || "Not Attempted")}
                            {userAnswer?.isCorrect ? <CheckCircle className="inline h-4 w-4 ml-1" /> : <XCircle className="inline h-4 w-4 ml-1" />}
                          </p>
                          <p className="text-xs text-green-700">{t('correctAnswer')}: {q.options[q.correctAnswerIndex]}</p>
                          {q.explanation && <p className="text-xs text-muted-foreground mt-1">{t('explanation')}: {q.explanation}</p>}
                        </Card>
                      );
                    })}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-center p-6">
          <Button onClick={handleTryAgain} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <RotateCcw className="mr-2 h-4 w-4" /> {t('tryAnotherTest')}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (stage === "inProgress" && currentQuestion && currentSubject) {
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestionsInSubject = currentSubject.questions.length;

    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            {currentSubject.subjectName} - {t('question')} {questionNumber} / {totalQuestionsInSubject}
          </CardTitle>
          <CardDescription className="text-md pt-1">{testPaper?.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-foreground whitespace-pre-wrap">{currentQuestion.questionText}</p>
          <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={showAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-background transition-colors 
                ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10 text-green-700' : ''}
                ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-red-500 bg-red-500/10 text-red-700' : ''}
                ${!showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : ''}
              `}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="font-normal text-base cursor-pointer flex-grow">{option}</Label>
                {showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="h-5 w-5 text-green-500" />}
                {showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            ))}
          </RadioGroup>

          {showAnswer && (
            <Card className="bg-muted/70 p-4">
              <CardContent className="p-0 space-y-2">
                <p className="text-sm font-semibold">
                  {t('correctAnswer')}: {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{t('explanation')}: {currentQuestion.explanation}</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          {showAnswer ? (
            <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90">
              {currentSubjectIndex === (testPaper?.subjects.length ?? 0) - 1 && currentQuestionIndex === totalQuestionsInSubject - 1 
                ? t('finishTest') 
                : t('nextQuestion')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {t('submitAnswer')}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Default: User Details Form (stage === "details")
  return (
    <Card className="max-w-lg mx-auto shadow-xl">
      <CardHeader className="text-center">
        <BookCopy className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold font-headline text-primary">{t('aiModelTestTitle')}</CardTitle>
        <CardDescription className="text-lg">{t('aiModelTestDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="studentName" className="text-base">{t('studentName')}</Label>
          <Input 
            id="studentName" 
            value={studentName} 
            onChange={(e) => setStudentName(e.target.value)} 
            placeholder={t('studentNamePlaceholder')} 
            className="h-12 text-base mt-1"
          />
        </div>
        <div>
          <Label htmlFor="studentClass" className="text-base">{t('selectYourClass')}</Label>
          <Select value={studentClass} onValueChange={setStudentClass}>
            <SelectTrigger className="h-12 text-base mt-1">
              <SelectValue placeholder={t('selectYourClassPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {classLevels.map(level => (
                <SelectItem key={level} value={level} className="text-base">
                  {t(level as any) || level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleStartTest} className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
          {t('startTestButton')}
        </Button>
      </CardContent>
    </Card>
  );
}

    
