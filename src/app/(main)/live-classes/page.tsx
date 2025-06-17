
"use client";

// This page is deprecated. Live Class functionality has been merged into Courses.
// Admins can add live session details directly to course descriptions in Firestore.

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function LiveClassesPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Info className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">
            {/* {t('liveClassesTitle')} // Translation key commented out */}
            Live Classes Information
          </CardTitle>
          <CardDescription className="text-lg">
            {/* {t('liveClassesDesc')} // Translation key commented out */}
            Information about live sessions is now available within individual course details.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Please check the "Free Courses" and "Premium Courses" sections to find courses that may include live interactive sessions. 
            Details about any live components will be provided in the course description.
          </p>
           <p className="text-sm text-muted-foreground mt-4">
            Admins: To specify live session details for a course, please add this information to the 'description' or a new 'liveSessionDetails' field in the 'courses' collection in Firestore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    