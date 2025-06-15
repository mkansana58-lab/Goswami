
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const JOB_ALERTS_COLLECTION = 'jobAlerts';

interface JobAlert {
  id: string;
  title: string;
  lastDateToApply: string; // Could be Timestamp if more complex filtering is needed
  detailsLink: string;
  organization?: string;
  postedAt: Timestamp;
}

export default function JobAlertsPage() {
  const { t, language } = useLanguage();
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobAlerts = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, JOB_ALERTS_COLLECTION), orderBy("postedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedAlerts: JobAlert[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAlerts.push({ id: doc.id, ...doc.data() } as JobAlert);
        });
        setJobAlerts(fetchedAlerts);
      } catch (error) {
        console.error("Error fetching job alerts from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobAlerts();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

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
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : jobAlerts.length > 0 ? (
            jobAlerts.map((alert) => (
              <Card key={alert.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <CardTitle className="text-lg text-secondary-foreground mb-1">{alert.title}</CardTitle>
                {alert.organization && <p className="text-sm font-medium text-muted-foreground">{alert.organization}</p>}
                <CardDescription className="text-sm text-muted-foreground mb-2">
                  {t('lastDateApply') || 'Last Date to Apply'}: {alert.lastDateToApply} <br />
                  {t('postedDate') || 'Posted On'}: {formatDate(alert.postedAt)}
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <a href={alert.detailsLink} target="_blank" rel="noopener noreferrer">
                    {t('viewDetails') || 'View Details'} <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </Card>
            ))
          ) : (
             <p className="text-center text-muted-foreground py-6">{t('noJobAlertsAvailable') || "No job alerts available at the moment."}</p>
          )}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {t('adminManageJobAlertsNote') || "Admin: Please add/manage job alerts in the 'jobAlerts' collection in Firestore."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// postedDate: "Posted On" (EN/HI)
// noJobAlertsAvailable: "No job alerts available at the moment." (EN/HI)
// adminManageJobAlertsNote: "Admin: Please add/manage job alerts in the 'jobAlerts' collection in Firestore." (EN/HI)
