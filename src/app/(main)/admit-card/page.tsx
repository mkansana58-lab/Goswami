
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type ScholarshipApplicationData, type AppConfig } from '@/lib/firebase';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AdmitCardDisplay } from '@/components/scholarship/admit-card-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function AdmitCardPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admitCardData, setAdmitCardData] = useState<ScholarshipApplicationData | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleDownload = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: t('applicationNumber') + " is required." });
      return;
    }
    
    if (appConfig?.admitCardDownloadStartDate && new Date() < appConfig.admitCardDownloadStartDate.toDate()) {
        toast({
            variant: "destructive",
            title: t('admitCardNotAvailable'),
            description: `${t('admitCardNotAvailableDesc')} ${format(appConfig.admitCardDownloadStartDate.toDate(), 'PPP, p')}`,
        });
        return;
    }

    setIsLoading(true);
    setAdmitCardData(null);
    try {
        const data = await getScholarshipApplicationByAppNumber(applicationNumber);
        if (!data) {
             toast({ variant: "destructive", title: "Not Found", description: "Application number not found." });
             return;
        }

        if (data.testMode === 'online') {
            toast({ 
                variant: 'default', 
                title: 'Online Test Applicant', 
                description: 'For online tests, please proceed to the Online Test portal directly.'
            });
            return;
        }

        // For offline tests, no Unique ID check is needed.
        setAdmitCardData(data);
        toast({ title: "Admit Card Found", description: "Your admit card is displayed below." });

    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your admit card." });
    } finally {
        setIsLoading(false);
    }
  };

  if (admitCardData && appConfig) {
      return (
        <AdmitCardDisplay 
            data={admitCardData} 
            scholarshipTestStartDate={appConfig.scholarshipTestStartDate?.toDate()}
            scholarshipTestEndDate={appConfig.scholarshipTestEndDate?.toDate()}
            onBack={() => setAdmitCardData(null)}
        />
      );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">{t('admitCard')}</h1>
       <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                यह पेज केवल **ऑफलाइन** परीक्षा देने वाले छात्रों के लिए है। ऑनलाइन परीक्षा देने वाले छात्र सीधे स्टूडेंट पोर्टल से टेस्ट दे सकते हैं।
            </AlertDescription>
        </Alert>
      
      {appConfig?.admitCardDownloadStartDate && new Date() < appConfig.admitCardDownloadStartDate.toDate() && (
         <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                {t('admitCardNotAvailable')} {t('admitCardNotAvailableDesc')} <strong>{format(appConfig.admitCardDownloadStartDate.toDate(), 'PPP, p')}</strong>.
            </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('admitCardTitle')}</CardTitle>
          <CardDescription>अपना एडमिट कार्ड डाउनलोड करने के लिए आवेदन संख्या दर्ज करें।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationNumber">{t('applicationNumber')}</Label>
            <Input id="applicationNumber" placeholder="GSA2024..." value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleDownload} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('admitCardDownloadBtn')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
