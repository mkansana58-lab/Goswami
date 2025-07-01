"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByAppNumber, getAppConfig, type AppConfig, type ScholarshipApplicationData, getScholarshipTestResultByAppNumber } from '@/lib/firebase';
import { Loader2, User, ArrowRight, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function OnlineScholarshipTestEntryPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { student, admin } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<'entry' | 'confirm' | 'payment'>('entry');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [verifiedApplicant, setVerifiedApplicant] = useState<ScholarshipApplicationData | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleProceed = async () => {
    if (!applicationNumber) {
      toast({ variant: "destructive", title: "Error", description: "Application Number is required." });
      return;
    }
    // Check if either student or admin is logged in
    if (!student && !admin) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to proceed." });
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
        const [appData, existingResult] = await Promise.all([
            getScholarshipApplicationByAppNumber(applicationNumber),
            getScholarshipTestResultByAppNumber(applicationNumber)
        ]);
        
        if (!appData) {
            toast({ variant: "destructive", title: "Invalid Application Number", description: "The Application Number you entered is not valid." });
            setIsLoading(false);
            return;
        }

        if (existingResult) {
            toast({ variant: "destructive", title: "Test Already Taken", description: "You have already submitted the test for this application number." });
            setIsLoading(false);
            return;
        }

        if (appData.testMode !== 'online') {
            toast({ variant: "destructive", title: "Incorrect Test Mode", description: "This application is registered for an Offline test." });
            setIsLoading(false);
            return;
        }

        // First, check for payment verification for ALL users.
        if (!appData.isPaymentVerified) {
            setVerifiedApplicant(appData);
            setStep('payment');
            setIsLoading(false);
            return;
        }

        // If payment IS verified, now check if the user is the correct student (if not admin).
        if (!admin) {
            if (!student || appData.fullName.trim().toLowerCase() !== student.name.trim().toLowerCase()) {
                toast({
                    variant: "destructive",
                    title: "Name Mismatch",
                    description: `The name on this application (${appData.fullName}) does not match the logged-in student's name (${student?.name}). Please check your details.`,
                    duration: 5000,
                });
                setIsLoading(false);
                return;
            }
        }
        
        // All checks passed.
        setVerifiedApplicant(appData);
        setStep('confirm');

    } catch (error) {
        console.error("Verification error:", error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while verifying your details." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!verifiedApplicant || !appConfig?.scholarshipTestId) {
        toast({ variant: 'destructive', title: 'Test Not Configured', description: 'The scholarship test has not been configured by the admin yet.' });
        return;
    }
     // Store applicant data in session storage to be used on the test page
    sessionStorage.setItem('scholarship-applicant-data', JSON.stringify(verifiedApplicant));
    router.push(`/tests/${appConfig.scholarshipTestId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <User className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">Online Scholarship Test</h1>
        <p className="text-muted-foreground">Enter your details to begin the test.</p>
      </div>

       {!appConfig?.scholarshipTestId && (
            <Alert variant="destructive">
                <AlertTitle>Test Not Available</AlertTitle>
                <AlertDescription>The admin has not configured the online scholarship test yet. Please check back later.</AlertDescription>
            </Alert>
        )}

      {step === 'entry' && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>Enter your Application Number to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application-number">{t('applicationNumber')}</Label>
              <Input id="application-number" placeholder="GSA2024..." value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} disabled={isLoading || !appConfig?.scholarshipTestId} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleProceed} disabled={isLoading || !appConfig?.scholarshipTestId}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Details"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'payment' && (
        <Card className="max-w-md mx-auto animate-in fade-in-50">
            <CardHeader>
                <CardTitle className="text-destructive">Payment Required</CardTitle>
                <CardDescription>To take the online test, please complete the payment.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                {appConfig?.paymentQrCodeUrl ? (
                    <Image src={appConfig.paymentQrCodeUrl} alt="Payment QR Code" width={250} height={250} className="mx-auto border-4 border-primary rounded-lg p-1" data-ai-hint="payment qr code"/>
                ) : (
                    <div className="w-64 h-64 bg-muted flex items-center justify-center rounded-lg mx-auto">
                        <p className="text-muted-foreground">QR Code not available.</p>
                    </div>
                )}
                <div className="text-lg font-semibold bg-accent text-accent-foreground p-3 rounded-lg">
                    <p>कृपया इस QR पर **₹20** का पेमेंट करें।</p>
                    <p className="mt-2">पेमेंट का स्क्रीनशॉट **"हमसे संपर्क करें"** पेज पर भेजें।</p>
                </div>
                <p className="text-sm text-muted-foreground">Verification के बाद आप टेस्ट दे पाएंगे।</p>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button onClick={() => router.push('/contact')} className="w-full">
                    Go to Contact Page <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
                <Button variant="outline" onClick={() => setStep('entry')} className="w-full">
                    Go Back
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
                <Alert>
                    <AlertTitle>Important Instructions</AlertTitle>
                    <AlertDescription>
                        The test is timed. Once started, you cannot pause it. Do not close the browser window or go back.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('entry')}>Go Back</Button>
                 <Button onClick={handleStartTest}>
                    Start Test <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          </Card>
      )}

    </div>
  );
}
