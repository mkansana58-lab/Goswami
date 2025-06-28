
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type ScholarshipApplicationData, type AppConfig } from '@/lib/firebase';
import { Loader2, AlertTriangle, CalendarCheck } from 'lucide-react';
import { AdmitCardDisplay } from '@/components/scholarship/admit-card-display'; // Re-using for similar layout
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function CityIntimationPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ScholarshipApplicationData | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleSearch = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: t('applicationNumber') + " is required." });
      return;
    }
    
    if (appConfig?.cityIntimationSlipStartDate && new Date() < appConfig.cityIntimationSlipStartDate.toDate()) {
        toast({
            variant: "destructive",
            title: "Not Available Yet",
            description: `City intimation slips will be available after ${format(appConfig.cityIntimationSlipStartDate.toDate(), 'PPP, p')}`,
        });
        return;
    }

    setIsLoading(true);
    setApplicationData(null);
    try {
        const data = await getScholarshipApplicationByAppNumber(applicationNumber);
        if (!data) {
             toast({ variant: "destructive", title: "Not Found", description: "Application number not found." });
             return;
        }

        setApplicationData(data);
        toast({ title: "Slip Found", description: "Your city intimation slip is displayed below." });
        
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your details." });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (applicationData) {
    // We can reuse the AdmitCardDisplay and just interpret it as a city slip
    // For a real app, we would create a dedicated CityIntimationSlipDisplay component.
    return <AdmitCardDisplay data={applicationData} examDate={appConfig?.examDate?.toDate()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <CalendarCheck className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">{t('cityIntimationSlip')}</h1>
        <p className="text-muted-foreground">Check your allotted examination city.</p>
      </div>
      
      {appConfig?.cityIntimationSlipStartDate && new Date() < appConfig.cityIntimationSlipStartDate.toDate() && (
         <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                City intimation slips will be available after <strong>{format(appConfig.cityIntimationSlipStartDate.toDate(), 'PPP, p')}</strong>.
            </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Find Your Exam City</CardTitle>
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
            Check City
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
