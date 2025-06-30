
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipTestResultByAppNumber, getScholarshipApplicationByAppNumber, type ScholarshipTestResult, type Question } from '@/lib/firebase';
import { Loader2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';


export default function ReviewAnswersPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<ScholarshipTestResult | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: t('applicationNumber') + " is required." });
      return;
    }
    setIsLoading(true);
    setTestResult(null);
    setSearchMessage(null);
    try {
        const result = await getScholarshipTestResultByAppNumber(applicationNumber);
        if (result) {
            setTestResult(result);
        } else {
            // Check if an application exists to differentiate between "not taken" and "invalid number"
            const application = await getScholarshipApplicationByAppNumber(applicationNumber);
            if (application) {
                if (application.testMode === 'offline') {
                    setSearchMessage("यह सुविधा केवल ऑनलाइन परीक्षा देने वाले छात्रों के लिए है।");
                } else {
                    setSearchMessage("आपने अभी तक ऑनलाइन स्कॉलरशिप टेस्ट नहीं दिया है।");
                }
            } else {
                setSearchMessage("यह एप्लीकेशन नंबर नहीं मिला। कृपया दोबारा जांचें।");
            }
        }
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching the results." });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <HelpCircle className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">{t('answerReviewTitle')}</h1>
        <p className="text-muted-foreground">{t('answerReviewDesc')}</p>
      </div>

      {!testResult ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('findMyAnswers')}</CardTitle>
            <CardDescription>{t('enterAppNumberToReview')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {searchMessage && (
                <Alert variant="destructive">
                    <AlertTitle>{searchMessage}</AlertTitle>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="applicationNumber">{t('applicationNumber')}</Label>
              <Input id="applicationNumber" placeholder="GSA2024..." value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('findMyAnswers')}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
            <Button variant="outline" onClick={() => { setTestResult(null); setApplicationNumber(''); }}>Search Again</Button>
            <Card>
                <CardHeader>
                    <CardTitle>Answer Review for {testResult.studentName}</CardTitle>
                    <CardDescription>Application Number: {testResult.applicationNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {testResult.allQuestions.map((question: Question, index: number) => {
                        const userAnswer = testResult.answers[question.id];
                        const isCorrect = userAnswer === question.answer;
                        return (
                            <div key={question.id} className="p-4 border rounded-lg bg-background/50">
                                <p className="font-semibold">Q{index + 1}: {question.question}</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-start">
                                        <Badge variant={isCorrect ? 'default' : 'destructive'} className="w-32 shrink-0 justify-center gap-1">
                                            {isCorrect ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {t('yourAnswer')}
                                        </Badge>
                                        <span className={`ml-4 ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                            {userAnswer || 'Not Answered'}
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                         <Badge variant="secondary" className="w-32 shrink-0 justify-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            {t('correctAnswer')}
                                        </Badge>
                                        <span className="ml-4 text-green-600">{question.answer}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
