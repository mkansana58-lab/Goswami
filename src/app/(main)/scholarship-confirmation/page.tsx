
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, type ScholarshipApplicationData } from '@/lib/firebase';
import { Loader2, Download } from 'lucide-react';
import { ConfirmationCertificate } from '@/components/scholarship/confirmation-certificate';

export default function ScholarshipConfirmationPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ScholarshipApplicationData | null>(null);


  const handleSearch = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: t('applicationNumber') + " is required." });
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

        const formDataForUI = {
            ...data,
            photoUrl: data.photoUrl,
            signatureUrl: data.signatureUrl,
        }

        setApplicationData(formDataForUI);
        
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your application." });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (applicationData) {
    return <ConfirmationCertificate formData={applicationData} applicationNumber={applicationData.applicationNumber} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <Download className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">{t('confirmationPage')}</h1>
        <p className="text-muted-foreground">Download your submitted application form.</p>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Find Your Application</CardTitle>
          <CardDescription>Enter your application number below to download the confirmation page.</CardDescription>
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
            Find Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
