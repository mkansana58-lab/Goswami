
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, BarChart, Lightbulb, MessageSquare, ArrowLeft } from 'lucide-react';
import type { CutoffCheckerOutput } from '@/ai/flows/cutoff-checker-flow';

interface Props {
  studentName: string;
  examName: string;
  result: CutoffCheckerOutput;
  onBack: () => void;
}

export function CutoffResultCertificate({ studentName, examName, result, onBack }: Props) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const getChanceColor = () => {
    switch(result.selectionChance) {
        case 'बहुत उच्च':
        case 'उच्च':
            return 'text-green-500';
        case 'मध्यम':
            return 'text-yellow-500';
        case 'कम':
            return 'text-red-500';
        default:
            return 'text-foreground';
    }
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
        <Button variant="outline" onClick={onBack} className="mb-4 no-print">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Form
        </Button>
        <div className="printable-area">
        <style jsx global>{`
            @media print {
            body * { visibility: hidden; }
            .printable-area, .printable-area * { visibility: visible; }
            .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin:0; padding: 1rem; }
            .no-print { display: none !important; }
            }
        `}</style>
        <Card className="border-2 border-primary">
            <CardHeader className="text-center bg-muted/20 p-4 items-center">
                <Scissors className="h-16 w-16 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary mt-2">Selection Chance Analysis</CardTitle>
                <CardDescription className="text-sm">{t('appName')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
                <p className="text-lg text-muted-foreground">Analysis for</p>
                <h2 className="text-3xl font-bold font-headline text-primary">{studentName}</h2>
                <p className="text-lg text-muted-foreground">for the exam</p>
                <h3 className="text-2xl font-semibold">{examName}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
                    <InfoBox icon={BarChart} title="Selection Chance" value={result.selectionChance} valueColor={getChanceColor()} />
                    <InfoBox icon={MessageSquare} title="Analysis" text={result.analysis} />
                    <InfoBox icon={Lightbulb} title="Advice" text={result.advice} />
                </div>

            </CardContent>
            <CardFooter className="justify-center p-4 no-print">
                <Button onClick={handlePrint}>Print Certificate</Button>
            </CardFooter>
        </Card>
        </div>
    </div>
  );
}

const InfoBox = ({ icon: Icon, title, value, text, valueColor }: { icon: React.ElementType, title: string, value?: string, text?: string, valueColor?: string }) => (
    <div className="bg-background border p-4 rounded-lg shadow-sm text-center">
        <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
        <p className="text-sm font-semibold text-muted-foreground mb-1">{title}</p>
        {value && <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>}
        {text && <p className="text-sm text-foreground">{text}</p>}
    </div>
);
