
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type AppConfig, type ScholarshipApplicationData } from '@/lib/firebase';
import { Loader2, KeyRound, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import Image from 'next/image';


// This is the hardcoded ID for the scholarship test.
// Admin must create a custom test with this exact ID.
const SCHOLARSHIP_TEST_ID = 'scholarship-test-main';

export default function OnlineScholarshipTestEntryPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { student } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<'entry' | 'confirm'>('entry');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [verifiedApplicant, setVerifiedApplicant] = useState<ScholarshipApplicationData | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleVerifyCode = async () => {
    if (!applicationNumber || !uniqueId) {
      toast({ variant: "destructive", title: "Error", description: "Application Number and Unique ID are required." });
      return;
    }
    if (!student) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to take the test." });
        return;
    }

    const now = new Date();
    if (appConfig?.scholarshipTestStartDate && now < appConfig.scholarshipTestStartDate.toDate()) {
        toast({ variant: "destructive", title: "Test Not Started", description: `The test will start on ${format(appConfig.scholarshipTestStartDate.toDate(), 'PPP p')}` });
        return;
    }
     if (appConfig?.scholarshipTestEndDate && now > appConfig.scholarshipTestEndDate.toDate()) {
        toast({ variant: "destructive", title: "Test Has Ended", description: `The test window has closed.` });
        return;
    }

    setIsLoading(true);
    try {
        const appData = await getScholarshipApplicationByAppNumber(applicationNumber);
        
        if (!appData) {
            toast({ variant: "destructive", title: "Invalid Application Number", description: "The Application Number you entered is not valid." });
            return;
        }

        if (appData.uniqueId !== uniqueId) {
             toast({ variant: "destructive", title: "Invalid Unique ID", description: "The Unique ID you entered is incorrect." });
            return;
        }

        if (appData.testMode !== 'online') {
            toast({ variant: "destructive", title: "Incorrect Test Mode", description: "This application is registered for an Offline test." });
            return;
        }

        if (appData.fullName !== student.name) {
            toast({ variant: "destructive", title: "Mismatch Error", description: "This application does not belong to you. Please check your details." });
            return;
        }

        setVerifiedApplicant(appData);
        setStep('confirm');
        toast({ title: "Details Verified", description: "Please confirm your identity to start the test." });

    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while verifying your details." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!verifiedApplicant) return;
     // Store applicant data in session storage to be used on the test page
    sessionStorage.setItem('scholarship-applicant-data', JSON.stringify(verifiedApplicant));
    router.push(`/tests/${SCHOLARSHIP_TEST_ID}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <KeyRound className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">Online Scholarship Test</h1>
        <p className="text-muted-foreground">Enter your details from the admit card to begin.</p>
      </div>

      {step === 'entry' && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>Enter your Application Number and secret Unique ID to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application-number">{t('applicationNumber')}</Label>
              <Input id="application-number" placeholder="GSA2024..." value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unique-id">{t('uniqueId')}</Label>
              <Input id="unique-id" placeholder="Enter your 6-digit Unique ID" value={uniqueId} onChange={(e) => setUniqueId(e.target.value)} disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleVerifyCode} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Details"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'confirm' && verifiedApplicant && (
          <Card className="max-w-md mx-auto animate-in fade-in-50">
            <CardHeader>
                <CardTitle>Confirm Your Identity</CardTitle>
                <CardDescription>Please confirm that these are your details before starting the test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Image src={verifiedApplicant.photoUrl || 'https://placehold.co/80x80.png'} alt="Applicant photo" width={80} height={80} className="rounded-md border" data-ai-hint="student photo"/>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-semibold">Name:</span> {verifiedApplicant.fullName}</p>
                        <p><span className="font-semibold">App No:</span> {verifiedApplicant.applicationNumber}</p>
                        <p><span className="font-semibold">Class:</span> {verifiedApplicant.class}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('entry')}>Go Back</Button>
                 <Button className="w-full" onClick={handleStartTest}>
                    Start Test <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          </Card>
      )}

    </div>
  );
}
