
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByOnlineTestCode, getAppConfig, type AppConfig } from '@/lib/firebase';
import { Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';


// This is the hardcoded ID for the scholarship test.
// Admin must create a custom test with this exact ID.
const SCHOLARSHIP_TEST_ID = 'scholarship-test-main';

export default function OnlineScholarshipTestEntryPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { student } = useAuth();
  const router = useRouter();
  const [onlineTestCode, setOnlineTestCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getAppConfig().then(setAppConfig);
  }, []);

  const handleStartTest = async () => {
    if (!onlineTestCode) {
      toast({ variant: "destructive", title: "Error", description: "Online Test Code is required." });
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
        const appData = await getScholarshipApplicationByOnlineTestCode(onlineTestCode);
        
        if (!appData) {
            toast({ variant: "destructive", title: "Invalid Code", description: "The Online Test Code you entered is not valid." });
            return;
        }

        if (appData.fullName !== student.name) {
            toast({ variant: "destructive", title: "Mismatch Error", description: "This code does not belong to you. Please check your admit card." });
            return;
        }

        // Store applicant data in session storage to be used on the test page
        sessionStorage.setItem('scholarship-applicant-data', JSON.stringify(appData));
        
        toast({ title: "Code Verified", description: "Redirecting to the test..." });
        router.push(`/tests/${SCHOLARSHIP_TEST_ID}`);

    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred while verifying your code." });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <KeyRound className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">Online Scholarship Test</h1>
        <p className="text-muted-foreground">Enter the code from your admit card to begin.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Your Code</CardTitle>
          <CardDescription>This code is available on your admit card if you selected the 'Online' test mode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="online-test-code">Online Test Code</Label>
            <Input id="online-test-code" placeholder="Enter your code here" value={onlineTestCode} onChange={(e) => setOnlineTestCode(e.target.value)} disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStartTest} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    