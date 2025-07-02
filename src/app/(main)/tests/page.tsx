
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testsData, type TestDetails } from '@/lib/tests-data';
import { Clock, FileQuestion, Languages, Lock, Loader2, Star, Key } from 'lucide-react';
import { getCustomTests, getTestSettings, type CustomTest, type TestSetting, addTestEnrollment, getEnrollmentsForStudent, getTestResultsForStudentByTest, type TestEnrollment, getAppConfig } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AiTestPage() {
  const { t } = useLanguage();
  const { student } = useAuth();
  const { toast } = useToast();
  const [allTests, setAllTests] = useState<(TestDetails | CustomTest)[]>([]);
  const [testSettings, setTestSettings] = useState<Record<string, TestSetting>>({});
  const [enrolledTests, setEnrolledTests] = useState<TestEnrollment[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPageData = useCallback(async () => {
    try {
        const [customTests, settings, config] = await Promise.all([
            getCustomTests(),
            getTestSettings(),
            getAppConfig()
        ]);
        const staticTests = Object.values(testsData);
        let allTestsData = [...staticTests, ...customTests];

        if (config.scholarshipTestId) {
            allTestsData = allTestsData.filter(test => test.id !== config.scholarshipTestId);
        }

        setAllTests(allTestsData);
        setTestSettings(settings);

        if (student) {
            const enrollments = await getEnrollmentsForStudent(student.name);
            setEnrolledTests(enrollments);

            const counts: Record<string, number> = {};
            const countPromises = allTestsData.map(async (test) => {
                const results = await getTestResultsForStudentByTest(student.name, test.id);
                counts[test.id] = results.length;
            });
            await Promise.all(countPromises);
            setAttemptCounts(counts);
        }
    } catch (error) {
        console.error("Failed to fetch tests data:", error);
    }
  }, [student]);

  useEffect(() => {
    setIsLoading(true);
    fetchPageData().finally(() => setIsLoading(false));
  }, [fetchPageData]);

  const handleEnroll = async (test: TestDetails | CustomTest) => {
    if (!student) return;
    try {
        const testName = t(test.title as any) || test.title;
        const code = await addTestEnrollment(student.name, test.id, testName);
        
        await fetchPageData();

        toast({
            title: t('yourEnrollmentCodeIs'),
            description: <p className="font-mono text-lg">{code}</p>,
            duration: 10000,
        });
    } catch (e) {
        toast({ variant: 'destructive', title: t('enrollError') });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Tests...</p>
      </div>
    );
  }

  const TestCard = ({ test }: { test: TestDetails | CustomTest }) => {
    const isEnabledByAdmin = testSettings[test.id]?.isEnabled ?? true;
    const enrollment = enrolledTests.find(e => e.testId === test.id);
    const isEnrolled = !!enrollment;
    const [isEnrolling, setIsEnrolling] = useState(false);
    
    const attemptCount = attemptCounts[test.id] ?? 0;
    const totalAttempts = enrollment?.allowedAttempts ?? 2;
    const attemptsWaived = enrollment?.attemptsWaived ?? false;
    const hasAttemptsLeft = attemptCount < totalAttempts || attemptsWaived;
    
    const onEnrollClick = async () => {
        setIsEnrolling(true);
        await handleEnroll(test);
        setIsEnrolling(false);
    }
    
    const isLocked = !isEnabledByAdmin || (isEnrolled && !hasAttemptsLeft);

    return (
      <Card key={test.id} className="flex flex-col">
        <CardHeader>
          <CardTitle>{t(test.title as any) || test.title}</CardTitle>
          <CardDescription>{t(test.description as any) || test.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileQuestion className="h-4 w-4" />
            <span>{t('totalQuestions')}: {test.totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t('timeAllowed')}: {test.timeLimit} {t('minutes')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4" />
            <span>{t('medium')}: {test.medium}</span>
          </div>
          {test.testType !== 'custom' && 'subjects' in test && (
            <div className="pt-2">
              <p className="font-semibold text-sm text-primary">{t('subjects')}:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                  {(test as TestDetails).subjects.map(subject => (
                      <span key={subject.name} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                          {t(subject.name as any)} ({subject.questionCount})
                      </span>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch pt-4">
            {isEnrolled ? (
                <Button asChild className="w-full" disabled={isLocked}>
                    {isLocked ? (
                         <div className="flex items-center">
                            <Lock className="mr-2 h-4 w-4" /> {t('testLocked')}
                        </div>
                    ) : (
                        <Link href={`/tests/${test.id}`}>{t('startTest')}</Link>
                    )}
                </Button>
            ) : (
                <Button className="w-full" disabled={!isEnabledByAdmin || isEnrolling} onClick={onEnrollClick}>
                    {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                     !isEnabledByAdmin ? <Lock className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                    {!isEnabledByAdmin ? 'Locked' : t('enroll')}
                </Button>
            )}
            {isEnrolled && <p className="text-xs text-muted-foreground text-center mt-2">{attemptsWaived ? "Attempts: Unlimited" : `${t('attemptsLeft')}: ${Math.max(0, totalAttempts - attemptCount)} / ${totalAttempts}`}</p>}
        </CardFooter>
      </Card>
    );
  };
  
  const testsToShow = allTests.filter(test => {
      const isEnabled = testSettings[test.id]?.isEnabled ?? true;
      const isEnrolled = enrolledTests.some(e => e.testId === test.id);
      return isEnabled || isEnrolled;
  });
  
  const mockTestsToShow = testsToShow.filter(t => t.testType === 'mock' || t.testType === 'custom');
  const practiceTestsToShow = testsToShow.filter(t => t.testType === 'practice');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">{t('aiTestTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('aiTestDescription')}</p>
      </div>

       <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground">
            <Key className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">{t('unlockTestInfoTitle')}</AlertTitle>
            <AlertDescription className="text-primary/90">
                {t('unlockTestInfo')}
            </AlertDescription>
        </Alert>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('mockTests')}</h2>
        {mockTestsToShow.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {mockTestsToShow.map((test) => <TestCard key={test.id} test={test} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">{t('comingSoon')}</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('practiceTests')}</h2>
        {practiceTestsToShow.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {practiceTestsToShow.map((test) => <TestCard key={test.id} test={test} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">{t('comingSoon')}</p>
        )}
      </div>
    </div>
  );
}
