
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, BookCopy, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Download, LogOut, FileText, BrainCircuit, Languages, Replace } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';

type TestStage = "selection" | "details" | "generating" | "inProgress" | "completed";
type SubjectKey = 'Mathematics' | 'General Knowledge' | 'Reasoning' | 'Hindi';

interface UserAnswer {
  subjectIndex: number;
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

const TEST_DURATION_MINUTES = 20;

export default function TestSeriesPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [stage, setStage] = useState<TestStage>("selection");
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  
  const [testPaper, setTestPaper] = useState<TestPaper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA'));
  }, [language]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      setStage("completed");
      toast({ title: t('timeUpTitle'), description: t('testAutoSubmitted') });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, toast, t]);

  const handleSubjectSelect = (subject: SubjectKey) => {
    setSelectedSubject(subject);
    setStage("details");
  };

  const handleStartTest = async () => {
    if (!studentName || !studentClass || !selectedSubject) {
      toast({ title: t('errorOccurred'), description: t('nameAndClassRequired'), variant: "destructive" });
      return;
    }
    setStage("generating");
    setUserAnswers([]);
    setShowAnswer(false);
    setSelectedOption(null);
    setScore(0);
    setCurrentQuestionIndex(0);
    setTimeLeft(TEST_DURATION_MINUTES * 60);
    
    const result = await generateAIMockTest({ studentClass, language, subjectName: selectedSubject });
    
    if ('error'in result || result.subjects.length === 0) {
        toast({ title: t('errorOccurred'), description: ('error' in result && result.error) || t('aiTestError'), variant: "destructive" });
        setStage("details");
    } else {
        setTestPaper(result);
        setStage("inProgress");
        setTimerActive(true);
    }
  };

  const currentSubject: TestSubject | undefined = testPaper?.subjects[0];
  const currentQuestion: TestQuestion | undefined = currentSubject?.questions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || !currentSubject) return;

    const selectedIdx = parseInt(selectedOption, 10);
    const isCorrect = selectedIdx === currentQuestion.correctAnswerIndex;
    
    setUserAnswers(prev => [...prev, {
      subjectIndex: 0,
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
    setStage("selection");
    setSelectedSubject(null);
    setTestPaper(null);
    setTimerActive(false);
  };
  
  const handleDownloadCertificate = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (stage === "selection") {
    const subjects: { key: SubjectKey; icon: React.ElementType; labelKey: keyof ReturnType<typeof useLanguage>['t'] }[] = [
        { key: 'Mathematics', icon: Replace, labelKey: 'subjectMathematics' },
        { key: 'General Knowledge', icon: Languages, labelKey: 'subjectGeneralKnowledge' },
        { key: 'Reasoning', icon: BrainCircuit, labelKey: 'subjectReasoning' },
        { key: 'Hindi', icon: FileText, labelKey: 'subjectHindi' },
    ];
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <BookCopy className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('testSeries')}</CardTitle>
          <CardDescription className="text-lg">{t('selectSubjectForTest')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {subjects.map(subject => (
            <Button key={subject.key} onClick={() => handleSubjectSelect(subject.key)} className="h-24 flex-col gap-2 text-lg bg-card text-card-foreground border hover:bg-muted" variant="outline">
              <subject.icon className="h-8 w-8 text-primary" />
              {t(subject.labelKey)}
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (stage === "details" && selectedSubject) {
    return (
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <BookCopy className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t(selectedSubject === 'Mathematics' ? 'subjectMathematics' : selectedSubject === 'General Knowledge' ? 'subjectGeneralKnowledge' : selectedSubject === 'Reasoning' ? 'subjectReasoning' : 'subjectHindi')} Test</CardTitle>
          <CardDescription className="text-lg">{t('aiModelTestDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="studentName" className="text-base">{t('studentName')}</Label>
            <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder={t('studentNamePlaceholder')} className="h-12 text-base mt-1" />
          </div>
          <div>
            <Label htmlFor="studentClass" className="text-base">{t('selectYourClass')}</Label>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger className="h-12 text-base mt-1"><SelectValue placeholder={t('selectYourClassPlaceholder')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Class 6">{t('Class6')}</SelectItem>
                <SelectItem value="Class 9">{t('Class9')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleStartTest} className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90">{t('startTestButton')}</Button>
        </CardContent>
      </Card>
    );
  }

  if (stage === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t('generatingTest')}</p>
      </div>
    );
  }

  if (stage === "completed" && testPaper && currentSubject) {
    const totalQuestions = currentSubject.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-primary/50 print:shadow-none print:border-none">
        <CardHeader className="text-center bg-gradient-to-br from-primary/10 via-background to-primary/10 py-8 print:bg-none">
          <Award className="h-20 w-20 text-accent mx-auto mb-4 print:text-black" />
          <CardTitle className="text-3xl font-bold text-primary print:text-black">{t('testResultTitle')}</CardTitle>
          <CardDescription className="text-md text-muted-foreground print:text-gray-700">{testPaper.title}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-1"><p className="text-xl font-semibold">{studentName}</p><p className="text-sm text-muted-foreground">{t('class')}: {studentClass}</p></div>
          <Card className="bg-muted/50 p-4 print:bg-gray-100 print:border">
            <CardContent className="text-center space-y-2 p-0">
              <p className="text-4xl font-bold text-primary print:text-black">{score} / {totalQuestions}</p>
              <p className="text-lg text-accent print:text-blue-600">({percentage}%)</p>
              <p className="text-sm text-muted-foreground print:text-gray-700">{t('date')}: {currentDate}</p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-2 p-6 print:hidden">
          <Button onClick={handleDownloadCertificate} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('downloadCertificate')}</Button>
          <Button onClick={handleTryAgain} className="bg-accent text-accent-foreground hover:bg-accent/90"><RotateCcw className="mr-2 h-4 w-4" /> {t('tryAnotherTest')}</Button>
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
            <div className="flex justify-between items-center"><CardTitle className="text-xl md:text-2xl font-headline text-primary">{currentSubject.subjectName} - {t('question')} {questionNumber} / {totalQuestionsInSubject}</CardTitle><div className="flex items-center gap-2 text-lg font-semibold text-destructive"><TimerIcon className="h-5 w-5"/>{formatTime(timeLeft)}</div></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-foreground whitespace-pre-wrap">{currentQuestion.questionText}</p>
          <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={showAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md transition-colors ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-red-500 bg-red-500/10' : ''} ${!showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : 'border-input'}`}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className={`font-normal text-base cursor-pointer flex-grow ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'text-green-700' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'text-red-700' : ''}`}>
                  {option}
                  {showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />}
                  {showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="inline h-5 w-5 ml-2 text-red-500" />}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showAnswer && currentQuestion.explanation && (
            <Card className="bg-muted/70 p-4"><CardContent className="p-0 space-y-2"><p className="text-sm font-semibold">{t('explanation')}:</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentQuestion.explanation}</p></CardContent></Card>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {showAnswer ? (<Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90">{currentQuestionIndex === totalQuestionsInSubject - 1 ? t('finishTest') : t('nextQuestion')}<ChevronRight className="ml-2 h-4 w-4" /></Button>)
          : (<Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{t('submitAnswer')}</Button>)}
           <Button onClick={handleFinishEarly} variant="outline" className="w-full sm:w-auto" disabled={showAnswer}><LogOut className="mr-2 h-4 w-4" /> {t('finishTestEarly')}</Button>
        </CardFooter>
      </Card>
    );
  }

  return <div>{t('loading')}...</div>;
}
