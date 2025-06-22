
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, BookCopy, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Download, FileText, BrainCircuit, Languages, ListChecks, ArrowLeft, GraduationCap, Shield, School, AlertTriangle, ClipboardCheck, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateAIMockTest } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STUDENT_USERNAME_KEY } from '@/lib/constants';

type TestStage = "selection" | "details" | "subjectList" | "generating" | "inProgress" | "completed";
type TestType = "sainik_school" | "rms" | "jnv" | "subject_wise";

interface SubjectConfig {
  key: string;
  nameKey: keyof ReturnType<typeof useLanguage>['t'];
  icon: React.ElementType;
  questions: number;
  marksPerQuestion?: number;
  totalMarks: number;
}

interface TestConfig {
  [className: string]: SubjectConfig[];
}

const testConfigs: Record<TestType, TestConfig> = {
  sainik_school: {
    'Class 6': [
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit, questions: 50, marksPerQuestion: 3, totalMarks: 150 },
      { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', icon: Languages, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Language', nameKey: 'subjectLanguage', icon: FileText, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Intelligence', nameKey: 'subjectReasoning', icon: BrainCircuit, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
    ],
    'Class 9': [
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit, questions: 50, marksPerQuestion: 4, totalMarks: 200 },
      { key: 'English', nameKey: 'subjectEnglish', icon: FileText, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Intelligence', nameKey: 'subjectReasoning', icon: BrainCircuit, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'General Science', nameKey: 'subjectGeneralScience', icon: Languages, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Social Studies', nameKey: 'subjectSocialStudies', icon: ListChecks, questions: 25, marksPerQuestion: 2, totalMarks: 50 },
    ],
  },
   rms: {
    'Class 6': [
        { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit, questions: 50, totalMarks: 50 },
        { key: 'English', nameKey: 'subjectEnglish', icon: FileText, questions: 50, totalMarks: 50 },
        { key: 'Intelligence', nameKey: 'subjectReasoning', icon: BrainCircuit, questions: 50, totalMarks: 50 },
        { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', icon: Languages, questions: 50, totalMarks: 50 },
    ],
    'Class 9': [
        { key: 'Paper-I English', nameKey: 'subjectEnglish', icon: FileText, questions: 100, totalMarks: 100 },
        { key: 'Paper-II Hindi & Social Science', nameKey: 'subjectSocialStudies', icon: ListChecks, questions: 100, totalMarks: 100 },
        { key: 'Paper-III Maths & Science', nameKey: 'subjectGeneralScience', icon: Languages, questions: 100, totalMarks: 100 },
    ],
  },
  jnv: {
    'Class 6': [
      { key: 'Mental Ability', nameKey: 'subjectMentalAbility', icon: BrainCircuit, questions: 40, totalMarks: 50 },
      { key: 'Arithmetic', nameKey: 'subjectArithmetic', icon: BrainCircuit, questions: 20, totalMarks: 25 },
      { key: 'Language', nameKey: 'subjectLanguage', icon: FileText, questions: 20, totalMarks: 25 },
    ],
    'Class 9': [
      { key: 'English', nameKey: 'subjectEnglish', icon: FileText, questions: 15, totalMarks: 15 },
      { key: 'Hindi', nameKey: 'subjectHindi', icon: FileText, questions: 15, totalMarks: 15 },
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit, questions: 35, totalMarks: 35 },
      { key: 'Science', nameKey: 'subjectGeneralScience', icon: Languages, questions: 35, totalMarks: 35 },
    ],
  },
  subject_wise: {
      'All': [
          { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit, questions: 15, totalMarks: 30 },
          { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', icon: Languages, questions: 15, totalMarks: 30 },
          { key: 'Reasoning', nameKey: 'subjectReasoning', icon: BrainCircuit, questions: 15, totalMarks: 30 },
          { key: 'Hindi', nameKey: 'subjectHindi', icon: FileText, questions: 15, totalMarks: 30 },
          { key: 'English', nameKey: 'subjectEnglish', icon: FileText, questions: 15, totalMarks: 30 },
          { key: 'General Science', nameKey: 'subjectGeneralScience', icon: Languages, questions: 15, totalMarks: 30 },
      ]
  }
};

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

  // Load student name and progress from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem(STUDENT_USERNAME_KEY);
    if(storedName) setStudentName(storedName);

    if (selectedTestType && selectedClass) {
        const progressKey = `testProgress_${selectedTestType}_${selectedClass}`;
        const storedProgress = localStorage.getItem(progressKey);
        if (storedProgress) {
            setTestProgress(JSON.parse(storedProgress));
        } else {
            setTestProgress({});
        }
    }
  }, [selectedTestType, selectedClass]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleFinishSubjectTest();
      toast({ title: t('timeUpTitle'), description: t('testAutoSubmitted') });
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, timeLeft, toast, t]);


  const resetTestState = () => {
    setActiveTestPaper(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowAnswer(false);
    setTimerActive(false);
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

  const handleFinishSubjectTest = () => {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const newProgress = {
      ...testProgress,
      [selectedSubject!.key]: {
        score: correctAnswers,
        totalQuestions: activeTestPaper!.subjects[0].questions.length,
      }
    };
    setTestProgress(newProgress);
    const progressKey = `testProgress_${selectedTestType}_${selectedClass}`;
    localStorage.setItem(progressKey, JSON.stringify(newProgress));

    toast({ title: t('testSubmitted'), description: `${t('yourScoreIs')} ${correctAnswers}/${activeTestPaper!.subjects[0].questions.length}`});
    resetTestState();
    setStage("subjectList");
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
  
  const renderSelectionScreen = () => (
    <Card className="max-w-4xl mx-auto shadow-xl bg-card border-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
            <Trophy className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('testSeries')}</CardTitle>
        <CardDescription>{t('selectTestType')}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Button onClick={() => { setSelectedTestType("sainik_school"); setStage('details'); }} className="h-20 text-lg flex items-center gap-3"><Shield className="h-6 w-6"/>{t('sainikSchoolMockTest')}</Button>
        <Button onClick={() => { setSelectedTestType("rms"); setStage('details'); }} className="h-20 text-lg flex items-center gap-3"><GraduationCap className="h-6 w-6"/>{t('rmsMockTest')}</Button>
        <Button onClick={() => { setSelectedTestType("jnv"); setStage('details'); }} className="h-20 text-lg flex items-center gap-3"><School className="h-6 w-6"/>{t('jnvMockTest')}</Button>
        <Button onClick={() => { setSelectedTestType("subject_wise"); setStage('details'); }} className="h-20 text-lg md:col-span-2 lg:col-span-3 flex items-center gap-3"><BookCopy className="h-6 w-6"/>{t('subjectWiseTest')}</Button>
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
    const subjects = testConfigs[selectedTestType]?.[selectedClass] || testConfigs.subject_wise.All;
    const allSubjectsCompleted = subjects.every(s => testProgress[s.key]);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setStage('details'); setTestProgress({}); }} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> {t('backButton')}</Button>
        {subjects.map(subject => {
            const result = testProgress[subject.key];
            return (
                <Card key={subject.key} className="bg-card shadow-md">
                    <CardHeader>
                        <CardTitle>{t(subject.nameKey)}</CardTitle>
                        <CardDescription>{subject.questions} {t('questions')} | {subject.totalMarks} {t('marksLabel')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result ? (
                             <div className="font-semibold text-primary">{t('score')}: {result.score} / {result.totalQuestions}</div>
                        ) : (
                             <p className="text-muted-foreground">{t('testPendingStatus')}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                       <Button onClick={()=> handleStartSubjectTest(subject)} className="w-full">
                           {result ? t('retakeTestButton') : t('startTestButton')}
                       </Button>
                    </CardFooter>
                </Card>
            )
        })}
        <Card className="bg-card shadow-md p-4 space-y-2">
            <Button className="w-full" disabled={!allSubjectsCompleted} onClick={() => setStage('completed')}>
              <Award className="mr-2 h-4 w-4" />{t('generateFinalCertificate')}
            </Button>
             <p className="text-xs text-muted-foreground text-center">
                {!allSubjectsCompleted && t('allSubjectsCompleteToCertify')}
             </p>
            <Button variant="destructive" className="w-full" onClick={() => {setTestProgress({}); localStorage.removeItem(`testProgress_${selectedTestType}_${selectedClass}`);}}>
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
        <CardHeader><div className="flex justify-between items-center"><CardTitle className="text-xl md:text-2xl text-foreground">{currentSubjectData.subjectName} ({questionNumber}/{totalQuestions})</CardTitle><div className="flex items-center gap-2 text-lg font-semibold text-primary"><TimerIcon className="h-5 w-5"/>{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</div></div></CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-foreground/90 whitespace-pre-wrap">{currentQuestion.questionText}</p>
          {currentQuestion.figureImageUrl && <div className="flex justify-center"><Image src={currentQuestion.figureImageUrl} alt="Question Figure" width={150} height={100} className="rounded-md bg-white"/></div>}
          <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={showAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md transition-colors ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-destructive bg-destructive/10' : ''} ${!showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className={`font-normal text-base cursor-pointer flex-grow ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'text-green-400' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'text-red-400' : ''}`}>{option}{showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />}{showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="inline h-5 w-5 ml-2 text-red-500" />}</Label>
              </div>
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

    const subjects = testConfigs[selectedTestType]?.[selectedClass];
    let totalObtainedMarks = 0;
    let totalMarks = 0;

    subjects.forEach(subject => {
        const result = testProgress[subject.key];
        if(result) {
            totalObtainedMarks += result.score * (subject.marksPerQuestion || 1);
        }
        totalMarks += subject.totalMarks;
    });

    let statusKey = 'testResultFail';
    let statusColor = 'text-destructive';

    if (selectedTestType === 'sainik_school') {
        if (selectedClass === 'Class 6') {
            if (totalObtainedMarks > 250) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; }
            else if (totalObtainedMarks >= 225) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
        } else { // Class 9
            if (totalObtainedMarks > 345) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; }
            else if (totalObtainedMarks >= 320) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
        }
    } else if (selectedTestType === 'jnv') {
        const totalQuestions = subjects.reduce((acc, s) => acc + s.questions, 0);
        const correctAnswers = Object.values(testProgress).reduce((acc, r) => acc + r.score, 0);
        if (selectedClass === 'Class 6') {
            if (correctAnswers > 70) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; }
            else if (correctAnswers >= 60) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
        } else { // Class 9
            if (correctAnswers > 80) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; }
            else if (correctAnswers >= 70) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
        }
    } else { // RMS or Subject-wise
        if ((totalObtainedMarks / totalMarks) >= 0.7) { statusKey = 'testResultPass'; statusColor = 'text-green-500'; }
        else if ((totalObtainedMarks / totalMarks) >= 0.5) { statusKey = 'testResultAverage'; statusColor = 'text-yellow-500'; }
    }


    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-border/50 print:shadow-none print:border-none bg-card">
          <div id="certificate" className="p-6 space-y-4">
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

  return <div className="max-w-4xl mx-auto space-y-8">{renderContent()}</div>;
}

