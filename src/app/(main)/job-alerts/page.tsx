
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const jobAlerts = [
  { id: 'ja001', title: 'भारतीय सेना में जीडी भर्ती', lastDate: '30 जुलाई 2024', link: '#' },
  { id: 'ja002', title: 'वायु सेना ग्रुप X/Y आवेदन', lastDate: '15 अगस्त 2024', link: '#' },
  { id: 'ja003', title: 'नौसेना SSR/MR नई रिक्तियां', lastDate: '10 अगस्त 2024', link: '#' },
];

export default function JobAlertsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Briefcase className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navJobAlerts')}</CardTitle>
          <CardDescription className="text-lg">{t('jobAlertsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobAlerts.map((alert) => (
            <Card key={alert.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <CardTitle className="text-lg text-secondary-foreground mb-1">{alert.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mb-2">
                {t('lastDateApply') || 'Last Date to Apply'}: {alert.lastDate}
              </CardDescription>
              <Button variant="outline" size="sm" asChild>
                <a href={alert.link} target="_blank" rel="noopener noreferrer">
                  {t('viewDetails') || 'View Details'} <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
          ))}
          <p className="text-center text-sm text-muted-foreground pt-4">
            यह पेज आपको रक्षा क्षेत्र की नवीनतम नौकरियों के बारे में सूचित करेगा। अभी यह निर्माणाधीन है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add 'lastDateApply' and 'viewDetails' to translations if needed.
