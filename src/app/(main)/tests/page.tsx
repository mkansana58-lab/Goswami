
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, BookCopy, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Download, FileText, BrainCircuit, Languages, ListChecks, ArrowLeft, GraduationCap, Shield, School, AlertTriangle, Trophy, ClipboardCheck } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STUDENT_USERNAME_KEY } from '@/lib/constants';
import { testConfigs, type SubjectConfig as SubjectConfigType, type TestType } from '@/lib/test-configs';
import { cn } from '@/lib/utils';

const subjectIcons: Record<string, React.ElementType> = {
  'Mathematics': BrainCircuit,
  'General Knowledge': Languages,
  'Language': FileText,
  'Intelligence': BrainCircuit,
  'English': FileText,
  'General Science': Languages,
  'Social Studies': ListChecks,
  'Mental Ability': BrainCircuit,
  'Arithmetic': BrainCircuit,
  'Hindi': FileText,
  'Reasoning': BrainCircuit,
  'Paper-I English': FileText,
  'Paper-II Hindi & Social Science': ListChecks,
  'Paper-III Maths & Science': Languages,
};

interface SubjectConfig extends SubjectConfigType {
  icon: React.ElementType;
}

type TestStage = "selection" | "details" | "subjectList" | "generating" | "inProgress" | "completed";

interface UserAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}
interface SubjectResult { score: number; totalQuestions: number; }
type TestProgress = Record<string, SubjectResult>;


const getTimerDuration = (testType: TestType, studentClass: string): number => {
    if(testType === 'sainik_school') return studentClass === 'Class 6' ? 150 * 60 : 180 * 60;
    if(testType === 'jnv') return studentClass === 'Class 6' ? 120 * 60 : 150 * 60;
    if(testType === 'rms') return 150 * 60;
    return 30 * 60; 
}


export default function TestSeriesPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // State Management
  const [stage, setStage] = useState<TestStage>("selection");
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectConfig | null>(null);
  const [studentName, setStudentName] = useState('');
  const [testProgress, setTestProgress] = useState<TestProgress>({});
  
  const [activeTestPaper, setActiveTestPaper] = useState<TestPaper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load student name and progress from localStorage
  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem(STUDENT_USERNAME_KEY);
    if(storedName) setStudentName(storedName);
  }, []);

  useEffect(() => {
    if (!isClient || !selectedTestType || !selectedClass) return;
    const progressKey = `testProgress_${selectedTestType}_${selectedClass}`;
    try {
        const storedProgress = localStorage.getItem(progressKey);
        if (storedProgress) {
            setTestProgress(JSON.parse(storedProgress));
        } else {
            setTestProgress({});
        }
    } catch(e) {
        console.error("Failed to parse test progress from localStorage", e);
        setTestProgress({});
    }
  }, [selectedTestType, selectedClass, isClient]);
  
  // Timer effect
  const handleFinishSubjectTest = useCallback(() => {
    if (!activeTestPaper || !selectedSubject) return;
    setTimerActive(false);

    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const newProgress = {
      ...testProgress,
      [selectedSubject.key]: {
        score: correctAnswers,
        totalQuestions: activeTestPaper.subjects[0].questions.length,
      }
    };
    setTestProgress(newProgress);
    if (isClient && selectedTestType && selectedClass) {
        const progressKey = `testProgress_${selectedTestType}_${selectedClass}`;
        localStorage.setItem(progressKey, JSON.stringify(newProgress));
    }

    toast({ title: t('testSubmitted'), description: `${t('yourScoreIs')} ${correctAnswers}/${activeTestPaper.subjects[0].questions.length}`});
    setActiveTestPaper(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowAnswer(false);
    setStage("subjectList");
  }, [activeTestPaper, userAnswers, testProgress, selectedSubject, toast, t, isClient, selectedTestType, selectedClass]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleFinishSubjectTest();
      toast({ title: t('timeUpTitle'), description: t('testAutoSubmitted') });
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, timeLeft, toast, t, handleFinishSubjectTest]);


  const resetTestState = () => {
    setActiveTestPaper(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowAnswer(false);
    setTimerActive(false);
    setTimeLeft(0);
  };
  
  const handleStartSubjectTest = async (subjectConfig: SubjectConfig) => {
    setSelectedSubject(subjectConfig);
    setStage("generating");
    resetTestState();
    
    const result = await generateAIMockTest({ 
      studentName,
      studentClass: selectedClass, 
      language, 
      testType: selectedTestType!,
      subject: subjectConfig.key 
    });
    
    if ('error'in result || !result.subjects || result.subjects.length === 0 || result.subjects[0].questions.length === 0) {
      toast({ title: t('errorOccurred'), description: ('error' in result && result.error) || t('aiTestGenerationError'), variant: "destructive" });
      setStage("subjectList");
    } else {
      setActiveTestPaper(result);
      if (selectedTestType !== 'subject_wise') {
          const totalDuration = getTimerDuration(selectedTestType!, selectedClass);
          setTimeLeft(totalDuration);
          setTimerActive(true);
      }
      setStage("inProgress");
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (activeTestPaper && currentQuestionIndex < activeTestPaper.subjects[0].questions.length - 1) {
      setCurrentQuestionIndex(qI => qI + 1);
    } else {
      handleFinishSubjectTest();
    }
  };
  
  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || !currentSubjectData) return;
    const selectedIdx = parseInt(selectedOption, 10);
    const isCorrect = selectedIdx === currentQuestion.correctAnswerIndex;
    setUserAnswers(prev => [...prev, { questionIndex: currentQuestionIndex, selectedOptionIndex: selectedIdx, isCorrect }]);
    setShowAnswer(true);
  };
  
  const currentSubjectData: TestSubject | undefined = activeTestPaper?.subjects[0];
  const currentQuestion: TestQuestion | undefined = currentSubjectData?.questions[currentQuestionIndex];

  const subjectsForCurrentTest = useMemo(() => {
    if (!selectedTestType || !selectedClass) return [];
    const subjects = testConfigs[selectedTestType]?.[selectedClass] || testConfigs.subject_wise.All;
    return subjects.map(s => ({...s, icon: subjectIcons[s.key] || BookCopy}));
  }, [selectedTestType, selectedClass]);
  
  const renderSelectionScreen = () => (
    <Card className="max-w-xl mx-auto shadow-xl bg-card border-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
            <ClipboardCheck className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('testSeries')}</CardTitle>
        <CardDescription>{t('selectTestType')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <Shield className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('sainikSchoolMockTest')}</CardTitle>
              <CardDescription>{t('sainikSchoolMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("sainik_school"); setStage('details'); }} className="w-full">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <GraduationCap className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('rmsMockTest')}</CardTitle>
              <CardDescription>{t('rmsMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
            <Button onClick={() => { setSelectedTestType("rms"); setStage('details'); }} className="w-full">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <School className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('jnvMockTest')}</CardTitle>
              <CardDescription>{t('jnvMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("jnv"); setStage('details'); }} className="w-full">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <BookCopy className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('subjectWiseTest')}</CardTitle>
              <CardDescription>{t('subjectWiseTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("subject_wise"); setStage('details'); }} className="w-full">{t('startButton')}</Button>
          </CardFooter>
        </Card>

      </CardContent>
    </Card>
  );

  const renderDetailsScreen = () => {
    if (!selectedTestType) return null;
    const classOptions = selectedTestType === 'subject_wise' 
      ? ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'NDA', 'CDS', 'UPSC', 'SSC']
      : ['Class 6', 'Class 9'];

    return (
      <Card className="max-w-lg mx-auto shadow-xl bg-card">
        <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => { setStage('selection'); setSelectedClass(''); }} className="absolute top-4 left-4"><ArrowLeft className="mr-2 h-4 w-4"/> {t('backButton')}</Button>
            <CardTitle className="text-center pt-10 text-2xl font-bold font-headline text-foreground">{t(selectedTestType === 'sainik_school' ? 'sainikSchoolMockTest' : selectedTestType === 'jnv' ? 'jnvMockTest' : selectedTestType === 'rms' ? 'rmsMockTest' : 'subjectWiseTest')}</CardTitle>
            <CardDescription className="text-center">{t('enterTestDetails')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="studentName">{t('studentName')}</Label><Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder={t('studentNamePlaceholder')} className="h-11 mt-1 bg-muted/50 border-border"/></div>
          <div>
            <Label>{t('selectYourClass')}</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}><SelectTrigger className="h-11 mt-1 bg-muted/50 border-border"><SelectValue placeholder={t('selectYourClassPlaceholder')} /></SelectTrigger>
              <SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={()=>setStage("subjectList")} className="w-full h-12 text-lg" disabled={!selectedClass || !studentName}>{t('startButton')}</Button>
        </CardContent>
      </Card>
    )
  };

  const renderSubjectList = () => {
    if (!selectedTestType || !selectedClass) return null;
    const allSubjectsCompleted = subjectsForCurrentTest.every(s => testProgress[s.key]);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setStage('details'); setTestProgress({}); }} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> {t('backButton')}</Button>
        <Card>
            <CardHeader><CardTitle>{t('selectSubjectForTest')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {subjectsForCurrentTest.map(subject => {
                    const result = testProgress[subject.key];
                    return (
                        <Card key={subject.key} className="bg-muted/50 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                           <div className="flex items-center gap-3">
                               <subject.icon className="h-8 w-8 text-primary" />
                               <div>
                                   <p className="font-semibold text-secondary-foreground">{t(subject.nameKey as any)}</p>
                                   <p className="text-xs text-muted-foreground">{subject.questions} {t('questions')} | {subject.totalMarks} {t('marksLabel')}</p>
                               </div>
                           </div>
                           <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                             {result ? (
                                <>
                                  <div className="font-semibold text-primary text-center sm:text-right">{t('score')}: {result.score} / {result.totalQuestions}</div>
                                  <Button size="sm" onClick={() => handleStartSubjectTest(subject)} variant="outline">{t('retakeTestButton')}</Button>
                                </>
                             ) : (
                                <Button size="sm" onClick={() => handleStartSubjectTest(subject)}>{t('startTestButton')}</Button>
                             )}
                           </div>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
        <Card className="bg-card shadow-md p-4 space-y-2">
            <Button className="w-full" disabled={!allSubjectsCompleted} onClick={() => setStage('completed')}>
              <Award className="mr-2 h-4 w-4" />{t('generateFinalCertificate')}
            </Button>
             {!allSubjectsCompleted && 
                <p className="text-xs text-muted-foreground text-center">
                    {t('allSubjectsCompleteToCertify')}
                </p>
             }
            <Button variant="destructive" className="w-full" onClick={() => {
                setTestProgress({}); 
                if(isClient) localStorage.removeItem(`testProgress_${selectedTestType}_${selectedClass}`);
            }}>
                <RotateCcw className="mr-2 h-4 w-4" />{t('resetProgressButton')}
            </Button>
        </Card>
      </div>
    )
  }
  
  const renderTestScreen = () => {
    if (!currentQuestion || !currentSubjectData) return <div className="text-center">{t('loading')}</div>;
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = currentSubjectData.questions.length;
    return (
      <Card className="max-w-3xl mx-auto shadow-lg bg-card">
        <CardHeader><div className="flex justify-between items-center"><CardTitle className="text-xl md:text-2xl text-foreground">{currentSubjectData.subjectName} ({questionNumber}/{totalQuestions})</CardTitle>{timerActive && <div className="flex items-center gap-2 text-lg font-semibold text-primary"><TimerIcon className="h-5 w-5"/>{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</div>}</div></CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-foreground/90 whitespace-pre-wrap">{currentQuestion.questionText}</p>
          {currentQuestion.figureImageUrl && <div className="flex justify-center"><Image src={currentQuestion.figureImageUrl} alt="Question Figure" width={150} height={100} className="rounded-md bg-white"/></div>}
          <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={showAnswer} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Label key={index} htmlFor={`option-${index}`} className={cn("flex items-center space-x-3 p-3 border rounded-md transition-colors cursor-pointer", showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10' : '', showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-destructive bg-destructive/10' : '', !showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : 'border-border', !showAnswer ? 'hover:bg-muted/80' : '')}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <span className={cn("font-normal text-base flex-grow", showAnswer && index === currentQuestion.correctAnswerIndex ? 'text-green-600' : '', showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'text-red-600' : '')}>{option}</span>
                {showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />}
                {showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="inline h-5 w-5 ml-2 text-red-500" />}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild><Button variant="outline" disabled={!currentQuestion.explanation}>{t('viewSolution')}</Button></SheetTrigger>
                  <SheetContent><SheetHeader><SheetTitle>{t('solutionLabel')}</SheetTitle><SheetDescription>{currentQuestion.questionText}</SheetDescription></SheetHeader><div className="py-4 whitespace-pre-wrap">{currentQuestion.explanation || t('noExplanationAvailable')}</div></SheetContent>
                </Sheet>
                 <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={showAnswer}>{t('finishTestEarly')}</Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmSubmitTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmSubmitMessage')}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>{t('noButton')}</AlertDialogCancel><AlertDialogAction onClick={handleFinishSubjectTest}>{t('yesButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
            </div>
            {showAnswer ? (<Button onClick={handleNextQuestion} className="w-full sm:w-auto">{questionNumber === totalQuestions ? t('finishTest') : t('nextQuestion')}<ChevronRight className="ml-2 h-4 w-4" /></Button>)
            : (<Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full sm:w-auto">{t('submitAnswer')}</Button>)}
        </CardFooter>
      </Card>
    )
  };

 const renderCompletionScreen = () => {
    if (!selectedTestType || !selectedClass) return null;

    let totalObtainedMarks = 0;
    let totalMarks = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;

    subjectsForCurrentTest.forEach(subject => {
        const result = testProgress[subject.key];
        if(result) {
            totalObtainedMarks += result.score * (subject.marksPerQuestion || 1);
            totalCorrect += result.score;
        }
        totalMarks += subject.totalMarks;
        totalQuestions += subject.questions;
    });

    let statusKey = 'testResultFail';
    let statusColor = 'text-destructive';
    let passed = false;

    if (selectedTestType === 'sainik_school' && selectedClass === 'Class 6') {
        if (totalObtainedMarks > 250) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; passed = true; }
        else if (totalObtainedMarks >= 225) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    } else if (selectedTestType === 'sainik_school' && selectedClass === 'Class 9') {
        if (totalObtainedMarks > 345) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; passed = true; }
        else if (totalObtainedMarks >= 320) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    } else if (selectedTestType === 'jnv' && selectedClass === 'Class 6') {
        if (totalCorrect > 70) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; passed = true; }
        else if (totalCorrect >= 60) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    } else if (selectedTestType === 'jnv' && selectedClass === 'Class 9') {
        if (totalCorrect > 80) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; passed = true; }
        else if (totalCorrect >= 70) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    } else { // RMS or Subject-wise
        if ((totalObtainedMarks / totalMarks) >= 0.7) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; passed = true; }
        else if ((totalObtainedMarks / totalMarks) >= 0.5) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    }

    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-border/50 print:shadow-none print:border-none bg-card">
          <div id="certificate" className="p-6 space-y-4 bg-white text-black">
              <CardHeader className="text-center p-0">
                  <div className="flex justify-center items-center gap-4">
                      <Image src="/logo.png" alt="Academy Logo" width={80} height={80} className="print:block hidden" />
                      <div className="flex-col text-center">
                          <CardTitle className="text-3xl font-bold text-primary print:text-black">{t('appName')}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground print:text-gray-700">{t('academyAddressPlaceholder')}</CardDescription>
                      </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground pt-4 print:text-black">{t('testResultTitle')}</h2>
              </CardHeader>
              <CardContent className="text-center p-0 space-y-2">
                  <p className="text-xl font-semibold">{studentName}</p>
                  <p className="text-sm text-muted-foreground">{t(selectedTestType === 'sainik_school' ? 'sainikSchoolMockTest' : selectedTestType === 'jnv' ? 'jnvMockTest' : 'subjectWiseTest')} - {selectedClass}</p>
                  <Card className="bg-muted/50 p-4 print:bg-gray-100 print:border my-4">
                      <CardContent className="p-0">
                          <p className="text-4xl font-bold text-primary print:text-black">{totalObtainedMarks} / {totalMarks}</p>
                          <p className={`text-xl font-bold ${statusColor}`}>{t(statusKey)}</p>
                      </CardContent>
                  </Card>
                  <div className="relative h-20 w-20 mx-auto mt-4">
                      <Image src="/stamp.png" alt={t('academyStampAlt')} width={80} height={80} className="opacity-70 print:opacity-100" />
                  </div>
              </CardContent>
          </div>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-2 p-6 pt-0 print:hidden">
              <Button onClick={() => window.print()} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('downloadCertificate')}</Button>
              <Button onClick={() => { setStage('selection'); setTestProgress({}); setSelectedTestType(null); setSelectedClass(''); }}><RotateCcw className="mr-2 h-4 w-4" /> {t('tryAnotherTest')}</Button>
          </CardFooter>
      </Card>
    )
  };
  
  const renderGeneratingScreen = () => (
     <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">{t('generatingTest')}</p>
      </div>
  );
  
  const renderContent = () => {
    switch(stage) {
      case 'selection': return renderSelectionScreen();
      case 'details': return renderDetailsScreen();
      case 'subjectList': return renderSubjectList();
      case 'generating': return renderGeneratingScreen();
      case 'inProgress': return renderTestScreen();
      case 'completed': return renderCompletionScreen();
      default: return <div className="text-center text-destructive">Error: Invalid stage.</div>;
    }
  };

  return <div className="max-w-5xl mx-auto space-y-8">{renderContent()}</div>;
}
