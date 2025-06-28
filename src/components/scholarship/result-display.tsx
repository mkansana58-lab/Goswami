
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download, Award, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import type { ScholarshipApplicationData } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface Props {
  data: ScholarshipApplicationData;
  onBack: () => void;
}

export function ResultDisplay({ data, onBack }: Props) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };
  
  const isPass = data.resultStatus === 'pass';

  return (
    <div className="max-w-4xl mx-auto my-8">
        <Button variant="outline" onClick={onBack} className="mb-4 no-print">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
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
                    <Award className="h-16 w-16 text-primary" />
                    <CardTitle className="text-2xl font-bold text-primary mt-2">{t('appName')}</CardTitle>
                    <CardDescription className="text-sm">{t('scholarshipForm')} - {t('result')}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-center space-y-6">
                    <p className="text-lg text-muted-foreground">Result for</p>
                    <h2 className="text-3xl font-bold font-headline text-primary">{data.fullName}</h2>
                    <p className="text-lg text-muted-foreground">Application Number: {data.applicationNumber}</p>

                    <div className={cn(
                        "mt-6 flex flex-col items-center justify-center gap-4 text-4xl font-bold",
                        isPass ? 'text-green-500' : 'text-destructive'
                    )}>
                        {isPass ? <ThumbsUp className="h-20 w-20" /> : <ThumbsDown className="h-20 w-20" />}
                        <span className="text-6xl">{isPass ? t('pass') : t('fail')}</span>
                    </div>

                    <p className="text-muted-foreground max-w-md mx-auto pt-4">
                        {isPass 
                            ? "Congratulations! You have successfully passed the scholarship exam. We will contact you soon with further details."
                            : "We regret to inform you that you did not pass the scholarship exam. We encourage you to continue working hard and wish you the best for your future."
                        }
                    </p>

                </CardContent>
                <CardFooter className="justify-center p-4 no-print">
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />{t('downloadCertificate')}</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
