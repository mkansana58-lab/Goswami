"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import type { ScholarshipApplicationData } from '@/lib/firebase';
import { format } from 'date-fns';

interface Props {
  data: ScholarshipApplicationData;
  examDate?: Date;
}

export function AdmitCardDisplay({ data, examDate }: Props) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-8 printable-area">
       <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none; }
        }
      `}</style>
      <Card className="border-2 border-primary">
        <CardHeader className="text-center bg-muted/20 p-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold text-primary">{t('appName')}</CardTitle>
              <CardDescription className="text-sm">{t('scholarshipForm')} - {t('admitCard')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="font-semibold">{t('applicationNumber')}:</p><p className="font-mono bg-accent text-accent-foreground px-2 py-1 rounded-md">{data.applicationNumber}</p>
                        <p className="font-semibold">{t('uniqueId')}:</p><p className="font-mono bg-accent text-accent-foreground px-2 py-1 rounded-md">{data.uniqueId}</p>
                        <p className="font-semibold">{t('fullName')}:</p><p>{data.fullName}</p>
                        <p className="font-semibold">{t('fathersName')}:</p><p>{data.fatherName}</p>
                        <p className="font-semibold">{t('selectClass')}:</p><p>{data.class}</p>
                        <p className="font-semibold">{t('schoolName')}:</p><p>{data.school}</p>
                        
                        <p className="font-semibold col-span-2 mt-4 text-primary">Exam Details:</p>
                        <p className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/>Exam Date:</p><p>{examDate ? format(examDate, 'PPP') : 'To be announced'}</p>
                        <p className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4"/>Exam Time:</p><p>{examDate ? format(examDate, 'p') : 'To be announced'}</p>
                        <p className="font-semibold col-span-2 mt-2">Exam Center:</p>
                        <p className="col-span-2">Go Swami Defence Academy, Main Branch</p>
                    </div>
                </div>
                <div className="space-y-4 flex flex-col items-center">
                    <div className="w-32 h-40 border-2 border-dashed flex items-center justify-center bg-muted/50">
                       <Image src={data.photoUrl} alt="Student Photo" width={128} height={160} className="object-cover w-full h-full" data-ai-hint="student photo"/>
                    </div>
                     <div className="w-32 h-16 border-2 border-dashed flex items-center justify-center bg-muted/50">
                        <Image src={data.signatureUrl} alt="Student Signature" width={128} height={64} className="object-contain w-full h-full" data-ai-hint="student signature"/>
                    </div>
                </div>
            </div>

             <Card className="mt-6 bg-destructive/10 border-destructive/50">
                <CardHeader><CardTitle className="text-destructive text-lg">Instructions for Candidate</CardTitle></CardHeader>
                <CardContent className="text-destructive/90 text-sm space-y-1">
                    <p>1. Please bring a printed copy of this admit card to the examination hall.</p>
                    <p>2. You must also bring a valid photo ID proof (e.g., Aadhar Card).</p>
                    <p>3. Reach the examination center at least 30 minutes before the reporting time.</p>
                    <p>4. No electronic devices are allowed inside the examination hall.</p>
                </CardContent>
            </Card>

        </CardContent>
        <CardFooter className="justify-center p-4 no-print">
            <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />{t('admitCardDownloadBtn')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
