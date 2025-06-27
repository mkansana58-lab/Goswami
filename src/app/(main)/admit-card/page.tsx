
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipApplicationByNumber, type ScholarshipApplicationData } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { AdmitCardDisplay } from '@/components/scholarship/admit-card-display';

export default function AdmitCardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admitCardData, setAdmitCardData] = useState<ScholarshipApplicationData | null>(null);

  const handleDownload = async () => {
    if (!applicationNumber || !uniqueId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both Application Number and Unique ID (your mobile number).",
      });
      return;
    }
    
    setIsLoading(true);
    setAdmitCardData(null);
    try {
        const data = await getScholarshipApplicationByNumber(applicationNumber, uniqueId);
        if (data) {
            setAdmitCardData(data);
            toast({ title: "Admit Card Found", description: "Your admit card is displayed below." });
        } else {
            toast({ variant: "destructive", title: "Not Found", description: "Application number or unique ID is incorrect." });
        }
    } catch (error) {
        console.error("Error fetching admit card:", error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your admit card." });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">{t('admitCard')}</h1>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('admitCardTitle')}</CardTitle>
          <CardDescription>{t('admitCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationNumber">{t('applicationNumber')}</Label>
            <Input 
              id="applicationNumber" 
              placeholder="GSA2024..." 
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uniqueId">{t('mobileNumber')}</Label>
            <Input 
              id="uniqueId" 
              placeholder="Enter your 10-digit mobile number" 
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleDownload} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('admitCardDownloadBtn')}
          </Button>
        </CardFooter>
      </Card>

      {admitCardData && (
        <div className="mt-8">
            <AdmitCardDisplay data={admitCardData} />
        </div>
      )}
    </div>
  );
}
