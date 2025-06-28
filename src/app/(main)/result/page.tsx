
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type ScholarshipApplicationData, type AppConfig } from '@/lib/firebase';
import { Loader2, AlertTriangle, Award } from 'lucide-react';
import { ResultDisplay } from '@/components/scholarship/result-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function ResultPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<ScholarshipApplicationData | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleSearch = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: t('applicationNumber') + " is required." });
      return;
    }
    
    if (appConfig?.resultAnnouncementDate && new Date() < appConfig.resultAnnouncementDate.toDate()) {
        toast({
            variant: "destructive",
            title: "Result Not Announced",
            description: `Results will be announced after ${format(appConfig.resultAnnouncementDate.toDate(), 'PPP, p')}`,
        });
        return;
    }

    setIsLoading(true);
    setResultData(null);
    try {
        const data = await getScholarshipApplicationByAppNumber(applicationNumber);
        if (!data) {
             toast({ variant: "destructive", title: "Not Found", description: "Application number not found." });
             return;
        }

        if (data.resultStatus === 'pending') {
            toast({
                variant: "default",
                title: "Result Not Declared",
                description: "Your result has not been declared yet. Please check back later.",
            });
            return;
        }

        setResultData(data);
        toast({ title: "Result Found", description: "Your result is displayed below." });
        
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your result." });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (resultData) {
    return <ResultDisplay data={resultData} onBack={() => setResultData(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <Award className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">{t('downloadResult')}</h1>
        <p className="text-muted-foreground">Enter your application number to view your result.</p>
      </div>
      
      {appConfig?.resultAnnouncementDate && new Date() < appConfig.resultAnnouncementDate.toDate() && (
         <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                Results will be announced after <strong>{format(appConfig.resultAnnouncementDate.toDate(), 'PPP, p')}</strong>.
            </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Result</CardTitle>
          <CardDescription>Enter your application number below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationNumber">{t('applicationNumber')}</Label>
            <Input id="applicationNumber" placeholder="GSA2024..." value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSearch} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Result
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
