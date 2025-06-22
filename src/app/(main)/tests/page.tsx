
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, BookCopy, ChevronRight, CheckCircle, XCircle, RotateCcw, Timer as TimerIcon, Download, FileText, BrainCircuit, Languages, ListChecks, ArrowLeft, GraduationCap, Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { generateTestPaper } from './actions';
import type { TestPaper, TestSubject, TestQuestion } from '@/ai/flows/generate-test-paper-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STUDENT_USERNAME_KEY } from '@/lib/constants';

type TestStage = "selection" | "details" | "generating" | "inProgress" | "completed";
type TestType = "sainik_school" | "jnv" | "subject_wise";

interface SubjectConfig {
  key: string;
  nameKey: keyof ReturnType<typeof useLanguage>['t'];
  icon: React.ElementType;
}

const testConfigs = {
  sainik_school: {
    'Class 6': [
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit },
      { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', icon: Languages },
      { key: 'Language', nameKey: 'subjectLanguage', icon: FileText },
      { key: 'Intelligence', nameKey: 'subjectReasoning', icon: BrainCircuit },
    ],
    'Class 9': [
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit },
      { key: 'English', nameKey: 'subjectEnglish', icon: FileText },
      { key: 'Intelligence', nameKey: 'subjectReasoning', icon: BrainCircuit },
      { key: 'General Science', nameKey: 'subjectGeneralScience', icon: Languages },
      { key: 'Social Studies', nameKey: 'subjectSocialStudies', icon: ListChecks },
    ],
  },
  jnv: {
    'Class 6': [
      { key: 'Mental Ability', nameKey: 'subjectMentalAbility', icon: BrainCircuit },
      { key: 'Arithmetic', nameKey: 'subjectArithmetic', icon: BrainCircuit },
      { key: 'Language', nameKey: 'subjectLanguage', icon: FileText },
    ],
    'Class 9': [
      { key: 'English', nameKey: 'subjectEnglish', icon: FileText },
      { key: 'Hindi', nameKey: 'subjectHindi', icon: FileText },
      { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit },
      { key: 'Science', nameKey: 'subjectGeneralScience', icon: Languages },
    ],
  },
  subject_wise: {
      'All': [
          { key: 'Mathematics', nameKey: 'subjectMathematics', icon: BrainCircuit },
          { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', icon: Languages },
          { key: 'Reasoning', nameKey: 'subjectReasoning', icon: BrainCircuit },
          { key: 'Hindi', nameKey: 'subjectHindi', icon: FileText },
          { key: 'English', nameKey: 'subjectEnglish', icon: FileText },
          { key: 'General Science', nameKey: 'subjectGeneralScience', icon: Languages },
      ]
  }
};

interface UserAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

const getTimerDuration = (testType: TestType, studentClass: string): number => {
    if(testType === 'sainik_school') return studentClass === 'Class 6' ? 150 * 60 : 180 * 60;
    if(testType === 'jnv') return studentClass === 'Class 6' ? 120 * 60 : 150 * 60;
    return 30 * 60; // Default for subject-wise
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
  
  const [testPaper, setTestPaper] = useState<TestPaper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem(STUDENT_USERNAME_KEY);
    if(storedName) setStudentName(storedName);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      setStage("completed");
      toast({ title: t('timeUpTitle'), description: t('testAutoSubmitted') });
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, timeLeft, toast, t]);

  const resetTestState = () => {
    setTestPaper(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowAnswer(false);
    setTimerActive(false);
  };
  
  const handleStartTest = async () => {
    if (!studentName || !selectedClass || !selectedSubject || !selectedTestType) {
      toast({ title: t('errorOccurred'), description: t('nameAndClassRequired'), variant: "destructive" });
      return;
    }
    setStage("generating");
    resetTestState();
    setTimeLeft(getTimerDuration(selectedTestType, selectedClass));
    
    const result = await generateTestPaper({ 
      studentName,
      studentClass: selectedClass, 
      language, 
      testType: selectedTestType,
      subject: selectedSubject.key 
    });
    
    if ('error'in result || result.subjects.length === 0) {
      toast({ title: t('errorOccurred'), description: ('error' in result && result.error) || t('aiTestError'), variant: "destructive" });
      setStage("details");
    } else {
      setTestPaper(result);
      setStage("inProgress");
      setTimerActive(true);
    }
  };

  const currentSubjectData: TestSubject | undefined = testPaper?.subjects[0];
  const currentQuestion: TestQuestion | undefined = currentSubjectData?.questions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || !currentSubjectData) return;
    const selectedIdx = parseInt(selectedOption, 10);
    const isCorrect = selectedIdx === currentQuestion.correctAnswerIndex;
    setUserAnswers(prev => [...prev, { questionIndex: currentQuestionIndex, selectedOptionIndex: selectedIdx, isCorrect }]);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (currentSubjectData && currentQuestionIndex < currentSubjectData.questions.length - 1) {
      setCurrentQuestionIndex(qI => qI + 1);
    } else {
      setTimerActive(false);
      setStage("completed");
      toast({ title: t('testSubmitted'), description: `${t('yourScoreIs')} ${userAnswers.filter(a => a.isCorrect).length}/${currentSubjectData?.questions.length}`});
    }
  };

  const getResultStatus = () => {
    if (!currentSubjectData) return { statusKey: 'testResultFail', color: 'text-destructive' };
    const score = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = currentSubjectData.questions.length;
    
    if (selectedTestType === 'sainik_school') {
        const marks = score * (selectedSubject?.key === 'Mathematics' && selectedClass === 'Class 6' ? 3 : 2);
        const totalMarks = totalQuestions * (selectedSubject?.key === 'Mathematics' && selectedClass === 'Class 6' ? 3 : 2);
        if (selectedClass === 'Class 6') {
            if (marks > 250) return { statusKey: 'testResultPass', color: 'text-green-500' };
            if (marks >= 225) return { statusKey: 'testResultAverage', color: 'text-yellow-500' };
            return { statusKey: 'testResultFail', color: 'text-destructive' };
        } else { // Class 9
            if (marks > 335) return { statusKey: 'testResultPass', color: 'text-green-500' };
            if (marks >= 320) return { statusKey: 'testResultAverage', color: 'text-yellow-500' };
            return { statusKey: 'testResultFail', color: 'text-destructive' };
        }
    } else if (selectedTestType === 'jnv') {
        if (selectedClass === 'Class 6') {
            if (score > 70) return { statusKey: 'testResultPass', color: 'text-green-500' };
            if (score >= 60) return { statusKey: 'testResultAverage', color: 'text-yellow-500' };
            return { statusKey: 'testResultFail', color: 'text-destructive' };
        } else { // Class 9
            if (score > 80) return { statusKey: 'testResultPass', color: 'text-green-500' };
            if (score >= 70) return { statusKey: 'testResultAverage', color: 'text-yellow-500' };
            return { statusKey: 'testResultFail', color: 'text-destructive' };
        }
    }
    return { statusKey: 'testResultCompleted', color: 'text-primary' }; // Fallback for subject-wise
  };

  const renderSelectionScreen = () => (
    <Card className="max-w-4xl mx-auto shadow-xl bg-card">
      <CardHeader className="text-center"><CardTitle className="text-3xl font-bold font-headline text-foreground">{t('testSeries')}</CardTitle><CardDescription>{t('selectTestType')}</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted cursor-pointer" onClick={() => { setSelectedTestType('sainik_school'); setStage('details'); }}>
              <Shield className="h-12 w-12 text-primary mb-4"/>
              <h3 className="text-xl font-semibold">{t('sainikSchoolMockTest')}</h3>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted cursor-pointer" onClick={() => { setSelectedTestType('jnv'); setStage('details'); }}>
              <GraduationCap className="h-12 w-12 text-primary mb-4"/>
              <h3 className="text-xl font-semibold">{t('jnvMockTest')}</h3>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted cursor-pointer" onClick={() => { setSelectedTestType('subject_wise'); setStage('details'); }}>
              <BookCopy className="h-12 w-12 text-primary mb-4"/>
              <h3 className="text-xl font-semibold">{t('subjectWiseTest')}</h3>
          </Card>
      </CardContent>
    </Card>
  );

  const renderDetailsScreen = () => {
    if (!selectedTestType) return null;
    const classOptions = selectedTestType === 'subject_wise' 
      ? ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'NDA', 'CDS', 'UPSC', 'SSC']
      : ['Class 6', 'Class 9'];
    const subjects = testConfigs[selectedTestType]?.[selectedClass as 'Class 6' | 'Class 9'] || testConfigs.subject_wise.All;

    return (
      <Card className="max-w-lg mx-auto shadow-xl bg-card">
        <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => { setStage('selection'); setSelectedClass(''); setSelectedSubject(null); }} className="absolute top-4 left-4"><ArrowLeft className="mr-2 h-4 w-4"/> {t('backButton')}</Button>
            <CardTitle className="text-center pt-10 text-2xl font-bold font-headline text-foreground">{t(selectedTestType === 'sainik_school' ? 'sainikSchoolMockTest' : selectedTestType === 'jnv' ? 'jnvMockTest' : 'subjectWiseTest')}</CardTitle>
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
          {selectedClass && <div>
            <Label>{t('subject')}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
                {subjects.map(s => <Button key={s.key} variant={selectedSubject?.key === s.key ? "default" : "outline"} onClick={() => setSelectedSubject(s)} className="flex-col h-20 gap-1"><s.icon className="h-6 w-6"/><span>{t(s.nameKey)}</span></Button>)}
            </div>
          </div>}
          <Button onClick={handleStartTest} className="w-full h-12 text-lg" disabled={!selectedClass || !selectedSubject || !studentName}>{t('startTestButton')}</Button>
        </CardContent>
      </Card>
    )
  };
  
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
              <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md transition-colors ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500/10' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'border-red-500 bg-red-500/10' : ''} ${!showAnswer && selectedOption === index.toString() ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className={`font-normal text-base cursor-pointer flex-grow ${showAnswer && index === currentQuestion.correctAnswerIndex ? 'text-green-400' : ''} ${showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex ? 'text-red-400' : ''}`}>{option}{showAnswer && index === currentQuestion.correctAnswerIndex && <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />}{showAnswer && selectedOption === index.toString() && index !== currentQuestion.correctAnswerIndex && <XCircle className="inline h-5 w-5 ml-2 text-red-500" />}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" disabled={!currentQuestion.explanation}>{t('viewSolution')}</Button></SheetTrigger>
              <SheetContent><SheetHeader><SheetTitle>{t('solutionLabel')}</SheetTitle><SheetDescription>{currentQuestion.questionText}</SheetDescription></SheetHeader><div className="py-4 whitespace-pre-wrap">{currentQuestion.explanation || t('noExplanationAvailable')}</div></SheetContent>
            </Sheet>
            {showAnswer ? (<Button onClick={handleNext} className="w-full">{questionNumber === totalQuestions ? t('finishTest') : t('nextQuestion')}<ChevronRight className="ml-2 h-4 w-4" /></Button>)
            : (<Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full">{t('submitAnswer')}</Button>)}
            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" className="w-full sm:w-auto" disabled={showAnswer}>{t('finishTestEarly')}</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('confirmSubmitTitle')}</AlertDialogTitle><AlertDialogDescription>{t('confirmSubmitMessage')}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>{t('noButton')}</AlertDialogCancel><AlertDialogAction onClick={() => setStage('completed')}>{t('yesButton')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    )
  };

  const renderCompletionScreen = () => {
    if (!testPaper || !currentSubjectData) return null;
    const score = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = currentSubjectData.questions.length;
    const { statusKey, color } = getResultStatus();

    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-border/50 print:shadow-none print:border-none bg-card">
          <div id="certificate" className="p-6 space-y-4">
              <CardHeader className="text-center p-0">
                  <div className="flex justify-center items-center gap-4">
                      <Image src="/logo.png" alt="Academy Logo" width={80} height={80} className="print:block hidden" />
                      <div className="flex-col text-center">
                          <CardTitle className="text-3xl font-bold text-primary print:text-black">{t('appName')}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground print:text-gray-700">खड़गपुर, धौलपुर, राजस्थान 328023</CardDescription>
                      </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground pt-4 print:text-black">{t('testResultTitle')}</h2>
              </CardHeader>
              <CardContent className="text-center p-0 space-y-2">
                  <p className="text-xl font-semibold">{studentName}</p>
                  <p className="text-sm text-muted-foreground">{t(selectedTestType === 'sainik_school' ? 'sainikSchoolMockTest' : selectedTestType === 'jnv' ? 'jnvMockTest' : 'subjectWiseTest')} - {selectedClass} - {currentSubjectData.subjectName}</p>
                  <Card className="bg-muted/50 p-4 print:bg-gray-100 print:border my-4">
                      <CardContent className="p-0">
                          <p className="text-4xl font-bold text-primary print:text-black">{score} / {totalQuestions}</p>
                          <p className={`text-xl font-bold ${color}`}>{t(statusKey)}</p>
                      </CardContent>
                  </Card>
                  <div className="relative h-20 w-20 mx-auto mt-4">
                      <Image src="/stamp.png" alt="Academy Stamp" width={80} height={80} className="opacity-70 print:opacity-100" />
                  </div>
              </CardContent>
          </div>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-2 p-6 pt-0 print:hidden">
              <Button onClick={() => window.print()} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('downloadCertificate')}</Button>
              <Button onClick={() => setStage('selection')}><RotateCcw className="mr-2 h-4 w-4" /> {t('tryAnotherTest')}</Button>
          </CardFooter>
      </Card>
    )
  };
  
  const renderContent = () => {
    switch(stage) {
      case 'selection': return renderSelectionScreen();
      case 'details': return renderDetailsScreen();
      case 'generating': return <div className="flex flex-col items-center justify-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-lg text-muted-foreground">{t('generatingTest')}</p></div>;
      case 'inProgress': return renderTestScreen();
      case 'completed': return renderCompletionScreen();
      default: return <div className="text-center text-destructive">Error: Invalid stage.</div>;
    }
  };

  return <div className="max-w-4xl mx-auto space-y-8">{renderContent()}</div>;
}
