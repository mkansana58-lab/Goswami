
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, BookCopy, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Printer, FileText, BrainCircuit, Languages, ListChecks, ArrowLeft, GraduationCap, Shield, School, Trophy } from 'lucide-react';
import { Solution } from '@/components/ui/lucide-icons';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STUDENT_USERNAME_KEY } from '@/lib/constants';
import { testConfigs, type SubjectConfig as SubjectConfigType, type TestType } from '@/lib/test-configs';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';


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
  'Science': Languages,
};

interface SubjectConfig extends SubjectConfigType {
  icon: React.ElementType;
}

type TestStage = "selection" | "details" | "subjectList" | "generating" | "inProgress" | "completed" | "review";

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
  const [subjectWiseTimer, setSubjectWiseTimer] = useState(15);
  const [subjectWiseSubject, setSubjectWiseSubject] = useState('');

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem(STUDENT_USERNAME_KEY);
    if(storedName) setStudentName(storedName);
  }, []);

  useEffect(() => {
    if (!isClient || !selectedTestType || !selectedClass) return;
    if(selectedTestType === 'subject_wise') {
        setTestProgress({});
        return;
    }
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
  
  const handleFinishTest = useCallback(() => {
    if (!activeTestPaper) return;
    setTimerActive(false);

    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    toast({ title: t('testSubmitted'), description: `${t('yourScoreIs')} ${correctAnswers}/${activeTestPaper.subjects[0].questions.length}`});

    if(selectedTestType !== 'subject_wise' && selectedSubject) {
        const newProgress = {
        ...testProgress,
        [selectedSubject.key]: {
            score: correctAnswers,
            totalQuestions: activeTestPaper.subjects[0].questions.length,
        }
        };
        setTestProgress(newProgress);
        if (isClient && selectedClass) {
            const progressKey = `testProgress_${selectedTestType}_${selectedClass}`;
            localStorage.setItem(progressKey, JSON.stringify(newProgress));
        }
        setStage("subjectList");
    } else {
        setStage("completed");
    }
    
  }, [activeTestPaper, userAnswers, testProgress, selectedSubject, toast, t, isClient, selectedTestType, selectedClass]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleFinishTest();
      toast({ title: t('timeUpTitle'), description: t('testAutoSubmitted') });
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, timeLeft, toast, t, handleFinishTest]);


  const resetTestState = () => {
    setActiveTestPaper(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowAnswer(false);
    setTimerActive(false);
    setTimeLeft(0);
  };
  
  const handleStartTest = async (subjectConfig: SubjectConfig | null) => {
    if(!selectedTestType || !selectedClass || !studentName) {
        toast({ title: t('errorOccurred'), description: t('nameAndClassRequired'), variant: 'destructive'});
        return;
    }
    
    let subjectKey: string;
    if (selectedTestType === 'subject_wise') {
        if (!subjectWiseSubject) {
            toast({ title: t('errorOccurred'), description: t('subjectIsRequired'), variant: 'destructive'});
            return;
        }
        subjectKey = subjectWiseSubject;
    } else if (subjectConfig) {
        subjectKey = subjectConfig.key;
        setSelectedSubject(subjectConfig);
    } else {
        return; 
    }
    
    setStage("generating");
    resetTestState();
    
    const result = await generateAIMockTest({ 
      studentName,
      studentClass: selectedClass, 
      language, 
      testType: selectedTestType,
      subject: subjectKey,
    });
    
    if ('error'in result || !result.subjects || result.subjects.length === 0 || result.subjects[0].questions.length === 0) {
      toast({ title: t('errorOccurred'), description: ('error' in result && result.error) || t('aiTestGenerationError'), variant: "destructive" });
      setStage(selectedTestType === 'subject_wise' ? "details" : "subjectList");
    } else {
      setActiveTestPaper(result);
      if (selectedTestType !== 'subject_wise') {
          const totalDuration = getTimerDuration(selectedTestType, selectedClass);
          setTimeLeft(totalDuration);
      } else {
          setTimeLeft(subjectWiseTimer * 60);
      }
      setTimerActive(true);
      setStage("inProgress");
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (activeTestPaper && currentQuestionIndex < activeTestPaper.subjects[0].questions.length - 1) {
      setCurrentQuestionIndex(qI => qI + 1);
    } else {
      handleFinishTest();
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
    const subjects = testConfigs[selectedTestType]?.[selectedClass];
    if (!subjects) return [];
    return subjects.map(s => ({...s, icon: subjectIcons[s.key] || BookCopy}));
  }, [selectedTestType, selectedClass]);
  
  const renderSelectionScreen = () => (
    <Card className="max-w-xl mx-auto shadow-xl bg-card border-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
            <Trophy className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('testSeries')}</CardTitle>
        <CardDescription>{t('selectTestType')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-muted/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <Shield className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('sainikSchoolMockTest')}</CardTitle>
              <CardDescription>{t('sainikSchoolMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("sainik_school"); setStage('details'); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <GraduationCap className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('rmsMockTest')}</CardTitle>
              <CardDescription>{t('rmsMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
            <Button onClick={() => { setSelectedTestType("rms"); setStage('details'); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <School className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('jnvMockTest')}</CardTitle>
              <CardDescription>{t('jnvMockTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("jnv"); setStage('details'); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t('startButton')}</Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <BookCopy className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-xl">{t('subjectWiseTest')}</CardTitle>
              <CardDescription>{t('subjectWiseTestDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
             <Button onClick={() => { setSelectedTestType("subject_wise"); setStage('details'); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t('startButton')}</Button>
          </CardFooter>
        </Card>

      </CardContent>
    </Card>
  );

  const renderDetailsScreen = () => {
    if (!selectedTestType) return null;
    const isSubjectWise = selectedTestType === 'subject_wise';
    const classOptions = isSubjectWise
      ? ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'NDA', 'CDS', 'UPSC', 'SSC']
      : ['Class 6', 'Class 9'];
    const subjectOptions = testConfigs.subject_wise.All;

    const handleProceed = () => {
        if (!studentName || !selectedClass) {
            toast({ title: t('errorOccurred'), description: t('nameAndClassRequired'), variant: 'destructive'});
            return;
        }
        if (isSubjectWise && !subjectWiseSubject) {
            toast({ title: t('errorOccurred'), description: t('subjectIsRequired'), variant: 'destructive'});
            return;
        }

        if (isSubjectWise) {
            handleStartTest(null);
        } else {
            setStage("subjectList");
        }
    }

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
          {isSubjectWise && (
            <>
              <div>
                <Label>{t('subject')}</Label>
                <Select value={subjectWiseSubject} onValueChange={setSubjectWiseSubject}><SelectTrigger className="h-11 mt-1 bg-muted/50 border-border"><SelectValue placeholder={t('selectSubjectForTest')} /></SelectTrigger>
                  <SelectContent>{subjectOptions.map(s => <SelectItem key={s.key} value={s.key}>{t(s.nameKey as any) || s.key}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='timer-slider'>{t('setTimerDuration')} ({subjectWiseTimer} {t('minutes')})</Label>
                <Slider id="timer-slider" defaultValue={[15]} value={[subjectWiseTimer]} max={35} min={1} step={1} onValueChange={(value) => setSubjectWiseTimer(value[0])} className="mt-2" />
              </div>
            </>
          )}
          <Button onClick={handleProceed} className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90">{t('startButton')}</Button>
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
                           <div className="flex items-center gap-2 w-full sm:w-auto">
                             {result ? (
                                <>
                                  <div className="font-semibold text-primary text-center sm:text-right text-lg">{result.score} / {result.totalQuestions}</div>
                                  <Button size="sm" onClick={() => handleStartTest(subject)} variant="outline">{t('retakeTestButton')}</Button>
                                </>
                             ) : (
                                <Button size="sm" onClick={() => handleStartTest(subject)} className="bg-primary text-primary-foreground hover:bg-primary/90">{t('startTestButton')}</Button>
                             )}
                           </div>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
        <Card className="bg-card shadow-md p-4 space-y-2">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!allSubjectsCompleted} onClick={() => setStage('completed')}>
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
    if (!currentQuestion || !currentSubjectData) return <div className="text-center">{t('generatingTest')}</div>;
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
                    <AlertDialogFooter><AlertDialogCancel>{t('noButton')}</AlertDialogCancel><AlertDialogAction onClick={handleFinishTest}>{t('yesButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
            </div>
            {showAnswer ? (<Button onClick={handleNextQuestion} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">{questionNumber === totalQuestions ? t('finishTest') : t('nextQuestion')}<ChevronRight className="ml-2 h-4 w-4" /></Button>)
            : (<Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">{t('submitAnswer')}</Button>)}
        </CardFooter>
      </Card>
    )
  };

 const renderCompletionScreen = () => {
    if (!selectedTestType || !selectedClass) return null;
    const isSubjectWise = selectedTestType === 'subject_wise';

    let totalObtainedMarks = 0;
    let totalMarks = 0;
    let statusKey = 'testResultFail';
    let adviceKey = 'adviceFail';
    
    if (isSubjectWise && activeTestPaper) {
        totalObtainedMarks = userAnswers.filter(a => a.isCorrect).length;
        totalMarks = activeTestPaper.subjects[0].questions.length;
        if (totalObtainedMarks >= 20) { statusKey = 'testResultPass'; adviceKey = 'advicePass'; }
        else if (totalObtainedMarks >= 15) { statusKey = 'testResultAverage'; adviceKey = 'adviceAverage'; }
    } else {
        subjectsForCurrentTest.forEach(subject => {
            const result = testProgress[subject.key];
            if(result) totalObtainedMarks += result.score * (subject.marksPerQuestion || 1);
            totalMarks += subject.totalMarks;
        });

        if (selectedTestType === 'sainik_school' && selectedClass === 'Class 6') {
            if (totalObtainedMarks >= 250) { statusKey = 'testResultPass'; adviceKey = 'advicePass'; }
            else if (totalObtainedMarks >= 225) { statusKey = 'testResultAverage'; adviceKey = 'adviceAverage'; }
        } else if (selectedTestType === 'sainik_school' && selectedClass === 'Class 9') {
            if (totalObtainedMarks >= 345) { statusKey = 'testResultPass'; adviceKey = 'advicePass'; }
            else if (totalObtainedMarks >= 320) { statusKey = 'testResultAverage'; adviceKey = 'adviceAverage'; }
        } else if (selectedTestType === 'jnv' && selectedClass === 'Class 6') {
            if (totalObtainedMarks >= 70) { statusKey = 'testResultPass'; adviceKey = 'advicePass'; }
            else if (totalObtainedMarks >= 60) { statusKey = 'testResultAverage'; adviceKey = 'adviceAverage'; }
        } else if (selectedTestType === 'jnv' && selectedClass === 'Class 9') {
            if (totalObtainedMarks > 80) { statusKey = 'testResultPass'; adviceKey = 'advicePass'; }
            else if (totalObtainedMarks >= 70) { statusKey = 'testResultAverage'; adviceKey = 'adviceAverage'; }
        }
    }
    
    const testTitle = isSubjectWise ? `${t(subjectWiseSubject as any) || subjectWiseSubject} ${t('subjectWiseTest')}` : t(selectedTestType as any);

    return (
      <div className="max-w-md mx-auto space-y-4">
        <div id="certificate" className="p-6 space-y-4 bg-white text-black border-4 border-blue-800 rounded-lg shadow-lg relative">
          <div className='absolute top-4 right-4'>
            <Image src="/logo.png" alt={t('appName')} width={60} height={60} />
          </div>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
            <Image src="/logo.png" alt={t('appName')} width={150} height={150} className='opacity-10'/>
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-blue-900 text-2xl">{t('appName')}</p>
            <p className="text-xs text-gray-600">{t('academyAddressPlaceholder')}</p>
          </div>
          <hr className="border-blue-800 my-2" />
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700">{t('certificateCertifiedThat')}</p>
            <p className="text-3xl font-bold text-blue-900">{studentName}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{t('certificateCompletedText').replace('{testName}', testTitle).replace('{class}', selectedClass)}</p>
            <p className="text-4xl font-bold text-blue-900 my-2">{totalObtainedMarks} <span className="text-2xl text-gray-600">/ {totalMarks}</span></p>
            <p className={`text-xl font-bold ${statusKey === 'testResultPass' ? 'text-green-600' : statusKey === 'testResultAverage' ? 'text-yellow-600' : 'text-red-600'}`}>{t(statusKey as any)} ({t(statusKey.replace('testResult', 'status').toLowerCase() as any)})</p>
            <p className="text-xs text-gray-500 italic">{t(adviceKey as any)}</p>
          </div>
          <div className="flex justify-between items-end mt-4 text-xs text-gray-600">
            <div>
              <p>{t('certificateDate')}</p>
              <p className='font-semibold'>{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <div className="text-center">
                <Image src="/stamp.png" alt={t('academyStampAlt')} width={70} height={70} className="mx-auto" />
                <hr className="border-gray-600 mt-1"/>
                <p>{t('certificateSignature')}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2 print:hidden">
            <Button onClick={() => setStage('review')} variant="outline"><Solution className="mr-2 h-4 w-4"/> {t('viewSolution')}</Button>
            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> {t('printDownloadButton')}</Button>
            <Button onClick={() => { resetTestState(); setStage(isSubjectWise ? 'details' : 'subjectList'); }}><RotateCcw className="mr-2 h-4 w-4" /> {t('tryAnotherTest')}</Button>
        </div>
      </div>
    )
  };
  
  const renderReviewScreen = () => {
      if (!activeTestPaper || userAnswers.length === 0) return <div>{t('noAnswersToReview')}</div>;
      return (
          <div className='max-w-2xl mx-auto space-y-4'>
              <Button onClick={() => setStage('completed')}><ArrowLeft className="mr-2 h-4 w-4"/> {t('backToCertificate')}</Button>
              <h2 className='text-2xl font-bold text-center'>{t('reviewAnswers')}</h2>
              {activeTestPaper.subjects[0].questions.map((q, index) => {
                  const userAnswer = userAnswers.find(a => a.questionIndex === index);
                  return (
                    <Card key={index} className="p-4">
                        <p className="font-semibold">{index + 1}. {q.questionText}</p>
                        <ul className="list-none space-y-1 mt-2">
                           {q.options.map((opt, optIndex) => (
                               <li key={optIndex} className={cn('text-sm p-1 rounded', 
                                   optIndex === q.correctAnswerIndex ? 'text-green-700 font-bold' : '', 
                                   userAnswer?.selectedOptionIndex === optIndex && optIndex !== q.correctAnswerIndex ? 'text-red-700 line-through' : '')
                               }>
                                   {optIndex === q.correctAnswerIndex ? <CheckCircle className="inline h-4 w-4 mr-2 text-green-500"/> : 
                                    userAnswer?.selectedOptionIndex === optIndex ? <XCircle className="inline h-4 w-4 mr-2 text-red-500"/> :
                                    <span className='inline-block w-6'></span>
                                   }
                                   {opt}
                               </li>
                           ))}
                        </ul>
                        {userAnswer === undefined && <p className='text-sm text-yellow-600 mt-2'>{t('notAttempted')}</p>}
                        <p className="text-xs text-muted-foreground mt-2"><span className='font-bold'>{t('explanation')}:</span> {q.explanation}</p>
                    </Card>
                  )
              })}
          </div>
      )
  }

  const renderGeneratingScreen = () => (
     <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">{t('generatingTest')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('generatingTestDesc')}</p>
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
      case 'review': return renderReviewScreen();
      default: return <div className="text-center text-destructive">Error: Invalid stage.</div>;
    }
  };

  return <div className="max-w-5xl mx-auto space-y-8">{renderContent()}</div>;
}
