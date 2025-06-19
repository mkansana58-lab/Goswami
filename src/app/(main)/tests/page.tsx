"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, Award, BookCopy, ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Download, Share2, LogOut, Stamp } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { STUDENT_LOGGED_IN_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import type { StudentProfileData } from '../student-profile/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type TestStage = "details" | "generating" | "inProgress" | "completed";

interface UserAnswer {
  subjectIndex: number;
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

const classLevels = ["Class6", "Class7", "Class8", "Class9", "Class10", "Class11", "Class12"];
const TEST_DURATION_MINUTES = 40;

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
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true';
      if (isLoggedIn) {
        const profileRaw = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
        if (profileRaw) {
          try {
            const profile: StudentProfileData = JSON.parse(profileRaw);
            setStudentName(profile.name || '');
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      setStage("completed");
      toast({ title: t('timeUpTitle') || "Time's Up!", description: t('testAutoSubmitted') || "Your test has been automatically submitted." });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, toast, t]);

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
    setTimeLeft(TEST_DURATION_MINUTES * 60);
    
    const result = await generateAIMockTest({ studentClass: t(studentClass as any) || studentClass, language });
    if ('error'in result) {
        toast({ title: t('errorOccurred'), description: result.error, variant: "destructive" });
        setStage("details");
        setTestPaper(null);
        setTimerActive(false);
    } else if (result.title.toLowerCase().includes("error") || (result.title.toLowerCase().includes("त्रुटि") && language === 'hi') ) {
        const firstQuestionText = result.subjects[0]?.questions[0]?.questionText || (language === 'hi' ? 'AI मॉडल पेपर बनाने में असमर्थ था।' : 'AI was unable to generate the model paper.');
        toast({ title: t('errorOccurred'), description: firstQuestionText, variant: "destructive" });
        setStage("details");
        setTestPaper(null);
        setTimerActive(false);
    } else {
        setTestPaper(result);
        setStage("inProgress");
        setTimerActive(true);
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
      setTimerActive(false);
      setStage("completed");
    }
  };
  
  const handleFinishEarly = () => {
    setTimerActive(false);
    setStage("completed");
  };

  const handleTryAgain = () => {
    setStage("details");
    setTestPaper(null);
    setTimerActive(false);
  };

  const getTotalQuestions = () => {
    return testPaper?.subjects.reduce((total, subject) => total + subject.questions.length, 0) || 0;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const handleDownloadCertificate = () => {
    if (typeof window !== 'undefined') {
        window.print();
    }
  };

  const handleShareCertificate = async () => {
    if (typeof window !== 'undefined' && navigator.share && testPaper) {
        try {
            await navigator.share({
                title: t('testResultTitle'),
                text: `${t('myTestScore')} ${studentName}: ${score}/${getTotalQuestions()} ${t('inText')} ${testPaper.title}. ${t('shareMessageAcademy') || "Achieved at Go Swami Defence Academy!"}`,
                url: window.location.href,
            });
        } catch (error: any) {
            console.error('Error sharing certificate:', error);
            if (error.name === 'AbortError') {
                // User cancelled the share operation, typically not an error to display
                console.log('Share operation aborted by user.');
            } else if (error.name === 'NotAllowedError' || error.message.toLowerCase().includes('permission denied')) {
                 toast({ title: t('errorOccurred'), description: t('sharePermissionDenied') || "Sharing permission was denied. Please check your browser settings or try again." , variant: "destructive"});
            } else {
                toast({ title: t('errorOccurred'), description: t('shareFailed') || "Could not share result." , variant: "destructive"});
            }
        }
    } else if (typeof window !== 'undefined') {
        toast({ title: t('featureNotSupported') || "Feature Not Supported", description: t('shareNotSupported') || "Web Share API is not supported on your browser or device." });
    }
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
      <Card className="max-w-2xl mx-auto shadow-xl border-primary/50 transform transition-all duration-500 scale-100 print:shadow-none print:border-none">
        <CardHeader className="text-center bg-gradient-to-br from-primary/10 via-background to-primary/10 py-8 print:bg-none">
          <Award className="h-20 w-20 text-accent mx-auto mb-4 print:text-black" />
          <CardTitle className="text-3xl font-bold text-primary print:text-black">{t('testResultTitle')}</CardTitle>
          <CardDescription className="text-md text-muted-foreground print:text-gray-700">{t('testCertificateDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
             <Image src="https://placehold.co/100x100.png?text=Stamp" alt={t('academyStampAlt') || "Academy Stamp"} width={80} height={80} data-ai-hint="academy logo stamp" className="opacity-75 print:opacity-100" />
            <div className="text-right">
                <p className="text-sm font-bold text-primary print:text-black">Go Swami Defence Academy</p>
                <p className="text-xs text-muted-foreground print:text-gray-600">{t('academyAddressPlaceholder') || "Academy Address, City, State"}</p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xl font-semibold">{studentName}</p>
            <p className="text-sm text-muted-foreground">{t('class')}: {t(studentClass as any) || studentClass}</p>
          </div>
          <Card className="bg-muted/50 p-4 print:bg-gray-100 print:border">
            <CardContent className="text-center space-y-2 p-0">
              <p className="text-lg font-medium">{testPaper.title}</p>
              <p className="text-4xl font-bold text-primary print:text-black">{score} / {totalQuestions}</p>
              <p className="text-lg text-accent print:text-blue-600">({percentage}%)</p>
              <p className="text-sm text-muted-foreground print:text-gray-700">{t('date')}: {currentDate}</p>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible className="w-full print:hidden">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('reviewAnswers') || "Review Your Answers"}</AccordionTrigger>
              <AccordionContent>
                {testPaper.subjects.map((subject, sIdx) => (
                  <div key={sIdx} className="mb-4">
                    <h4 className="font-semibold text-lg text-secondary-foreground mb-2">{subject.subjectName}</h4>
                    {subject.questions.map((q, qIdx) => {
                      const userAnswer = userAnswers.find(ua => ua.subjectIndex === sIdx && ua.questionIndex === qIdx);
                      return (
                        <Card key={`${sIdx}-${qIdx}`} className="p-3 mb-2 border rounded-md bg-background">
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
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-2 p-6 print:hidden">
          <Button onClick={handleDownloadCertificate} variant="outline">
            <Download className="mr-2 h-4 w-4" /> {t('downloadCertificate')}
          </Button>
          <Button onClick={handleShareCertificate} variant="outline">
            <Share2 className="mr-2 h-4 w-4" /> {t('shareResult')}
          </Button>
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
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl md:text-2xl font-headline text-primary">
                    {currentSubject.subjectName} - {t('question')} {questionNumber} / {totalQuestionsInSubject}
                </CardTitle>
                <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                    <TimerIcon className="h-5 w-5"/>
                    {formatTime(timeLeft)}
                </div>
            </div>
          <CardDescription className="text-md pt-1">{testPaper?.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-foreground whitespace-pre-wrap">{currentQuestion.questionText}</p>
          
          <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={showAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors 
                ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10' : ''}
                ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-red-500 bg-red-500/10' : ''}
                ${!showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : 'border-input'}
              `}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} 
                  className={`
                    ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 ring-green-500' : ''}
                    ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-red-500 ring-red-500' : ''}
                  `}
                />
                <Label htmlFor={`option-${index}`} 
                  className={`font-normal text-base cursor-pointer flex-grow
                    ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'text-green-700' : ''}
                    ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'text-red-700' : ''}
                  `}
                >
                  {option}
                  {showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />}
                  {showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="inline h-5 w-5 ml-2 text-red-500" />}
                </Label>
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
        <CardFooter className="flex flex-col sm:flex-row gap-2">
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
           <Button onClick={handleFinishEarly} variant="outline" className="w-full sm:w-auto" disabled={showAnswer}>
             <LogOut className="mr-2 h-4 w-4" /> {t('finishTestEarly') || "Finish Test Early"}
           </Button>
        </CardFooter>
      </Card>
    );
  }

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

// Add these to translations.ts
// sharePermissionDenied: "Sharing permission was denied. Please check your browser settings or try again." (EN/HI)
// sharePermissionDenied_hi: "शेयर करने की अनुमति अस्वीकार कर दी गई। कृपया अपनी ब्राउज़र सेटिंग्स जांचें या पुनः प्रयास करें।"

