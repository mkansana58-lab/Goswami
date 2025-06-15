
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, getDocs, type Timestamp, orderBy, query } from 'firebase/firestore';

interface RegistrationDataFirestore {
  id: string; // Firestore document ID
  studentName: string;
  emailAddress: string;
  phoneNumber: string;
  currentClass: string;
  address: string;
  registrationDate: Timestamp; // Firestore Timestamp
}

interface RegistrationDataDisplay {
  id: string;
  studentName: string;
  emailAddress: string;
  phoneNumber: string;
  currentClass: string;
  address: string;
  registrationDate: string; // Formatted date string
}

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';

export default function RegistrationsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationDataDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdminLoggedIn = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
      if (!isAdminLoggedIn) {
        router.replace('/login');
      } else {
        setIsAuthorized(true);
        const fetchRegistrations = async () => {
          try {
            const q = query(collection(db, "scholarshipRegistrations"), orderBy("registrationDate", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedRegistrations: RegistrationDataDisplay[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data() as Omit<RegistrationDataFirestore, 'id'>;
              fetchedRegistrations.push({
                id: doc.id,
                ...data,
                registrationDate: data.registrationDate.toDate().toLocaleDateString(), // Format Timestamp to string
              });
            });
            setRegistrations(fetchedRegistrations);
            setFetchError(null);
          } catch (error) {
            console.error("Error fetching registrations from Firestore:", error);
            setFetchError("Failed to load registrations. Please check your Firebase setup and internet connection.");
            setRegistrations([]); 
          } finally {
            setIsLoading(false);
          }
        };
        fetchRegistrations();
      }
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  if (!isAuthorized) {
     return (
        <div className="max-w-4xl mx-auto space-y-8 text-center py-10">
            <Card className="shadow-xl border-destructive">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                        <AlertTriangle /> {t('accessDenied')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t('accessDeniedMessage')}</p>
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
          {fetchError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorOccurred')}</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
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
            !fetchError && <p className="text-center text-muted-foreground py-8">{t('noRegistrations')}</p>
          )}
        </CardContent>
      </Card>
      {!fetchError && <p className="text-center text-sm text-muted-foreground">
        {t('localStorageNote').replace('local storage', 'Firebase Firestore')}
      </p>}
    </div>
  );
}
