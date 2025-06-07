
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface RegistrationData {
  id: string;
  studentName: string;
  emailAddress: string;
  phoneNumber: string;
  currentClass: string;
  address: string;
  registrationDate: string;
}

const LOCAL_STORAGE_KEY = 'scholarshipRegistrations';

// NOTE: This is a placeholder for actual admin authentication.
// In a real application, this page would be protected and only accessible to admins.
const isAdmin = true; 

export default function RegistrationsPage() {
  const { t } = useLanguage();
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      const storedRegistrationsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRegistrationsString) {
        try {
          const parsedRegistrations = JSON.parse(storedRegistrationsString);
          if (Array.isArray(parsedRegistrations)) {
            setRegistrations(parsedRegistrations);
          }
        } catch (error) {
          console.error("Error parsing registrations from localStorage:", error);
          setRegistrations([]); // Fallback to empty array on error
        }
      }
    }
  }, []);

  if (!isAdmin) {
    // In a real app, you might redirect or show an access denied message.
    // For this prototype, we'll assume the link in header won't be shown if not admin.
    return (
        <div className="max-w-4xl mx-auto space-y-8 text-center py-10">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('viewRegistrationsTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('viewRegistrationsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('studentName')}</TableHead>
                  <TableHead>{t('emailAddress')}</TableHead>
                  <TableHead>{t('phoneNumber')}</TableHead>
                  <TableHead>{t('currentClass')}</TableHead>
                  <TableHead>{t('address')}</TableHead>
                  <TableHead className="text-right">{t('registrationsTableDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.studentName}</TableCell>
                    <TableCell>{reg.emailAddress}</TableCell>
                    <TableCell>{reg.phoneNumber}</TableCell>
                    <TableCell>{reg.currentClass}</TableCell>
                    <TableCell>{reg.address}</TableCell>
                    <TableCell className="text-right">{reg.registrationDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('noRegistrations')}</p>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Note: This page displays data stored in your browser's local storage for demonstration.
      </p>
    </div>
  );
}
