
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testsData, type TestDetails } from '@/lib/tests-data';
import { Clock, BookOpen, FileQuestion, Languages, Lock, Loader2 } from 'lucide-react';
import { getCustomTests, getTestSettings, type CustomTest, type TestSetting } from '@/lib/firebase';

export default function AiTestPage() {
  const { t } = useLanguage();
  const [allTests, setAllTests] = useState<(TestDetails | CustomTest)[]>([]);
  const [testSettings, setTestSettings] = useState<Record<string, TestSetting>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const [customTests, settings] = await Promise.all([getCustomTests(), getTestSettings()]);
            const staticTests = Object.values(testsData);
            setAllTests([...staticTests, ...customTests]);
            setTestSettings(settings);
        } catch (error) {
            console.error("Failed to fetch tests data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchTests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Tests...</p>
      </div>
    );
  }

  const mockTests = allTests.filter(t => t.testType === 'mock' || t.testType === 'custom');
  const practiceTests = allTests.filter(t => t.testType === 'practice');

  const TestCard = ({ test }: { test: TestDetails | CustomTest }) => {
    const isEnabled = testSettings[test.id]?.isEnabled ?? true;
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
        <CardFooter>
          <Button asChild className="w-full" disabled={!isEnabled}>
            {isEnabled ? (
              <Link href={`/tests/${test.id}`}>{t('startTest')}</Link>
            ) : (
              <div className="flex items-center justify-center cursor-not-allowed">
                <Lock className="mr-2 h-4 w-4" />
                Locked
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">{t('aiTestTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('aiTestDescription')}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('mockTests')}</h2>
        {mockTests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {mockTests.map((test) => <TestCard key={test.id} test={test} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">{t('comingSoon')}</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('practiceTests')}</h2>
        {practiceTests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {practiceTests.map((test) => <TestCard key={test.id} test={test} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">{t('comingSoon')}</p>
        )}
      </div>
    </div>
  );
}
