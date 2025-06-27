
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { testsData, type Question, type TestDetails, type Subject } from '@/lib/tests-data';
import { addTestResult, getCustomTest, type CustomTest } from '@/lib/firebase';
import { ResultCertificate, type ResultData, type SubjectAnalysis } from '@/components/test/result-certificate';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestResultPage() {
    const { t } = useLanguage();
    const params = useParams();
    const { student } = useAuth();
    const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;

    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const calculateResults = async () => {
            if (!testId || !student) return;

            let testDetails: TestDetails | CustomTest | null = null;
            if (testsData[testId]) {
                testDetails = testsData[testId];
            } else {
                testDetails = await getCustomTest(testId);
            }
            
            if (testDetails) {
                const savedResult = sessionStorage.getItem(`test-result-${testId}`);
                if (savedResult) {
                    const { answers, timeLeft, questions } = JSON.parse(savedResult);
                    
                    setAllQuestions(questions);
                    setUserAnswers(answers);
                    
                    let totalCorrect = 0;
                    questions.forEach((q: Question, index: number) => {
                        if (answers[index] === q.answer) {
                            totalCorrect++;
                        }
                    });

                    let subjectAnalyses: SubjectAnalysis[] = [];
                    if (testDetails.testType !== 'custom' && 'subjects' in testDetails) {
                        let questionCursor = 0;
                        subjectAnalyses = testDetails.subjects.map((subject: Subject) => {
                            let subjectCorrect = 0;
                            const subjectQuestions = questions.slice(questionCursor, questionCursor + subject.questionCount);
                            
                            subjectQuestions.forEach((q: Question, index: number) => {
                                const overallIndex = questionCursor + index;
                                if (answers[overallIndex] === q.answer) {
                                    subjectCorrect++;
                                }
                            });
                            
                            questionCursor += subject.questionCount;

                            return {
                                name: t(subject.name as any),
                                score: subjectCorrect,
                                total: subject.questionCount
                            };
                        });
                    } else {
                        subjectAnalyses.push({ name: 'Overall Score', score: totalCorrect, total: testDetails.totalQuestions });
                    }


                    const timeTaken = (testDetails.timeLimit * 60) - timeLeft;
                    const status = (totalCorrect / testDetails.totalQuestions) >= 0.4 ? 'Pass' : 'Fail';
                    const percentage = (totalCorrect / testDetails.totalQuestions) * 100;

                    const finalResultData: ResultData = {
                        studentName: student.name,
                        testName: t(testDetails.title as any) || testDetails.title,
                        totalQuestions: testDetails.totalQuestions,
                        correctAnswers: totalCorrect,
                        timeTaken: timeTaken,
                        status: status,
                        subjects: subjectAnalyses
                    };
                    setResultData(finalResultData);

                    const firestoreResultData = {
                        studentName: student.name,
                        testId: testId,
                        testName: t(testDetails.title as any) || testDetails.title,
                        score: totalCorrect,
                        totalQuestions: testDetails.totalQuestions,
                        percentage: percentage,
                    };
                
                    addTestResult(firestoreResultData).catch(error => {
                        console.error("Failed to save test result:", error);
                    });
                }
            }
        }
        calculateResults();
    }, [testId, t, student]);

    if (!isClient) {
        return (
             <div className="max-w-4xl mx-auto my-8">
                <Card>
                    <CardHeader className="items-center"><Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-8 w-1/2 mt-2" /></CardHeader>
                    <CardContent className="p-6 text-center space-y-6">
                        <Skeleton className="h-6 w-1/3 mx-auto" />
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                            <Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-12 w-1/4 mx-auto mt-6" />
                    </CardContent>
                    <CardFooter className="justify-center"><Skeleton className="h-10 w-40" /></CardFooter>
                </Card>
             </div>
        )
    }

    if (!resultData) return <div className="text-center p-10">{t('calculatingResult')}</div>;

    return (
        <div className="space-y-8">
            <ResultCertificate resultData={resultData} />

            <Card>
                <CardHeader><CardTitle>{t('reviewAnswers')}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {allQuestions.map((question, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = userAnswer === question.answer;
                        return (
                            <div key={index} className="p-4 border rounded-lg">
                                <p className="font-semibold">Q{index + 1}: {question.question}</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <p className="flex items-start"><span className="font-medium w-32 shrink-0">{t('yourAnswer')}:</span><span className={`${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{userAnswer || 'Not Answered'}</span></p>
                                    <p className="flex items-start"><span className="font-medium w-32 shrink-0">{t('correctAnswer')}:</span><span className="text-green-600">{question.answer}</span></p>
                                </div>
                                <div className="mt-2">
                                    {isCorrect ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium px-2 py-1 bg-green-100 dark:bg-green-900/50 rounded-full"><CheckCircle className="h-3 w-3" /> Correct</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-destructive font-medium px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded-full"><XCircle className="h-3 w-3" /> Incorrect</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
