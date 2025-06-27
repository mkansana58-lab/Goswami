
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdmitCardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [uniqueId, setUniqueId] = useState('');

  const handleDownload = () => {
    if (!applicationNumber || !uniqueId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both Application Number and Unique ID.",
      });
      return;
    }
    // In a real app, you would fetch and generate the admit card PDF here.
    // For now, this is a demo.
    console.log(`Attempting to download admit card for App No: ${applicationNumber} with Unique ID: ${uniqueId}`);
    toast({
      title: "Success",
      description: `Downloading admit card for Application No: ${applicationNumber}. (This is a demo)`,
    });
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uniqueId">{t('uniqueId')}</Label>
            <Input 
              id="uniqueId" 
              placeholder="Enter your Unique ID" 
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleDownload}>{t('admitCardDownloadBtn')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
