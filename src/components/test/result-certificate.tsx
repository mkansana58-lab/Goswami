
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Award, CheckCircle, XCircle } from 'lucide-react';

export interface ResultData {
  studentName: string;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  status: 'Pass' | 'Fail';
}

interface Props {
  resultData: ResultData;
}

export function ResultCertificate({ resultData }: Props) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const scorePercentage = (resultData.correctAnswers / resultData.totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto my-8 printable-area">
       <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <Card className="border-2 border-primary">
        <CardHeader className="text-center bg-muted/20 p-4 items-center">
            <Award className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary mt-2">{t('testResultTitle')}</CardTitle>
            <CardDescription className="text-sm">{t('appName')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
            <p className="text-lg text-muted-foreground">This is to certify that</p>
            <h2 className="text-3xl font-bold font-headline text-primary">{resultData.studentName}</h2>
            <p className="text-lg text-muted-foreground">has successfully completed the test</p>
            <h3 className="text-2xl font-semibold">{resultData.testName}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
                <InfoBox label={t('totalMarks')} value={resultData.totalQuestions} />
                <InfoBox label={t('marksObtained')} value={resultData.correctAnswers} />
                <InfoBox label={t('score')} value={`${scorePercentage.toFixed(2)}%`} />
                <InfoBox label={t('timeTaken')} value={formatTime(resultData.timeTaken)} />
            </div>

            <div className={`mt-6 flex items-center justify-center gap-4 text-4xl font-bold ${resultData.status === 'Pass' ? 'text-green-500' : 'text-destructive'}`}>
                {resultData.status === 'Pass' ? <CheckCircle /> : <XCircle />}
                <span>{t(resultData.status.toLowerCase() as any)}</span>
            </div>

        </CardContent>
        <CardFooter className="justify-center p-4 no-print">
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                {t('printCertificate')}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const InfoBox = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-background border p-4 rounded-lg text-center shadow-sm">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
);
