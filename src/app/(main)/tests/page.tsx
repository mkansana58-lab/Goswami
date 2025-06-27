
"use client";

import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testsData } from '@/lib/tests-data';
import { Clock, BookOpen, FileQuestion, Languages } from 'lucide-react';

export default function AiTestPage() {
  const { t } = useLanguage();

  const mockTests = Object.values(testsData).filter(t => t.testType === 'mock');
  const practiceTests = Object.values(testsData).filter(t => t.testType === 'practice');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">{t('aiTestTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('aiTestDescription')}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('mockTests')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {mockTests.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(test.title)}</CardTitle>
                <CardDescription>{t(test.description)}</CardDescription>
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
                <div className="pt-2">
                  <p className="font-semibold text-sm text-primary">{t('subjects')}:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                      {test.subjects.map(subject => (
                          <span key={subject.name} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                              {t(subject.name as any)} ({subject.questionCount})
                          </span>
                      ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/tests/${test.id}`}>{t('startTest')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">{t('practiceTests')}</h2>
         <div className="grid md:grid-cols-2 gap-6">
          {practiceTests.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(test.title)}</CardTitle>
                <CardDescription>{t(test.description)}</CardDescription>
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
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/tests/${test.id}`}>{t('startTest')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
