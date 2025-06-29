
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type ScholarshipApplicationData, type AppConfig } from '@/lib/firebase';
import { Loader2, AlertTriangle, CalendarCheck, ShieldCheck, MapPin, Download, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import Image from 'next/image';

const CityIntimationSlipDisplay = ({ data, config, onBack }: { data: ScholarshipApplicationData, config: AppConfig, onBack: () => void }) => {
    const { t } = useLanguage();
    const handlePrint = () => window.print();

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
                    <CardHeader className="text-center bg-muted/20 p-4">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <ShieldCheck className="h-12 w-12 text-primary" />
                            <div>
                            <CardTitle className="text-2xl font-bold text-primary">{t('appName')}</CardTitle>
                            <CardDescription className="text-sm">{t('cityIntimationSlip')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p className="font-semibold">{t('applicationNumber')}:</p><p className="font-mono">{data.applicationNumber}</p>
                                    <p className="font-semibold">{t('fullName')}:</p><p>{data.fullName}</p>
                                    <p className="font-semibold">{t('fathersName')}:</p><p>{data.fatherName}</p>
                                    <p className="font-semibold col-span-2 mt-4 text-primary">Exam City & Date Information:</p>
                                    <p className="font-semibold col-span-2 flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5"/>Exam Center:</p>
                                    <p className="col-span-2 -mt-2">Go Swami Defence Academy, Khargpur, Dholpur, Rajasthan - 328023</p>
                                    <p className="font-semibold flex items-center gap-2"><CalendarCheck className="h-4 w-4"/>Admit Card Available From:</p><p>{config.admitCardDownloadStartDate ? format(config.admitCardDownloadStartDate.toDate(), 'PPP') : 'To be announced'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-40 border-2 border-dashed flex items-center justify-center bg-muted/50">
                                <Image src={data.photoUrl} alt="Student Photo" width={128} height={160} className="object-cover w-full h-full" data-ai-hint="student photo"/>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center p-4 no-print">
                        <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />Print Slip</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};


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
  
  if (applicationData && appConfig) {
    return <CityIntimationSlipDisplay data={applicationData} config={appConfig} onBack={() => setApplicationData(null)} />;
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
          <CardDescription>Enter your application number to find your slip.</CardDescription>
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
