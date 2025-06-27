
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { testsData } from '@/lib/tests-data';
import { ResultCertificate, type ResultData } from '@/components/test/result-certificate';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestResultPage() {
    const { t } = useLanguage();
    const params = useParams();
    const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;

    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (testId && testsData[testId]) {
            const savedResult = localStorage.getItem(`test-result-${testId}`);
            if (savedResult) {
                const { answers: userAnswers, timeLeft } = JSON.parse(savedResult);
                const testDetails = testsData[testId];
                
                const allQuestions = testDetails.subjects.flatMap(s => s.questions);
                
                let totalCorrect = 0;
                allQuestions.forEach((q, index) => {
                    if (userAnswers[index] === q.answer) {
                        totalCorrect++;
                    }
                });

                const timeTaken = (testDetails.timeLimit * 60) - timeLeft;

                // Pass if score is 40% or more
                const status = (totalCorrect / testDetails.totalQuestions) >= 0.4 ? 'Pass' : 'Fail';

                setResultData({
                    studentName: "Student Name", // Placeholder for now
                    testName: t(testDetails.title),
                    totalQuestions: testDetails.totalQuestions,
                    correctAnswers: totalCorrect,
                    timeTaken: timeTaken,
                    status: status,
                });
            }
        }
    }, [testId, t]);

    if (!isClient) {
        return (
             <div className="max-w-4xl mx-auto my-8">
                <Card>
                    <CardHeader className="items-center">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-8 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="p-6 text-center space-y-6">
                        <Skeleton className="h-6 w-1/3 mx-auto" />
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-12 w-1/4 mx-auto mt-6" />
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Skeleton className="h-10 w-40" />
                    </CardFooter>
                </Card>
             </div>
        )
    }

    if (!resultData) return <div className="text-center p-10">{t('calculatingResult')}</div>;

    return (
        <div>
            <ResultCertificate resultData={resultData} />
        </div>
    );
}
