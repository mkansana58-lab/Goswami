
"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase'; 
import { collection, getDocs, type Timestamp, orderBy, query } from 'firebase/firestore';

interface RegistrationDataFirestore {
  id: string; 
  studentName: string;
  emailAddress: string;
  phoneNumber: string;
  currentClass: string;
  address: string;
  registrationDate: Timestamp; 
}

interface RegistrationDataDisplay {
  id: string;
  studentName: string;
  emailAddress: string;
  phoneNumber: string;
  currentClass: string;
  address: string;
  registrationDate: string; 
}

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const SCHOLARSHIP_COLLECTION_NAME = "scholarshipRegistrations";

export default function RegistrationsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationDataDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    console.log("RegistrationsPage: useEffect triggered.");
    if (typeof window !== 'undefined') {
      const isAdminLoggedIn = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
      console.log("RegistrationsPage: Admin logged in status:", isAdminLoggedIn);
      if (!isAdminLoggedIn) {
        console.log("RegistrationsPage: Admin not logged in, redirecting to /login.");
        router.replace('/login');
      } else {
        setIsAuthorized(true);
        console.log("RegistrationsPage: Admin authorized. Fetching registrations...");
        const fetchRegistrations = async () => {
          try {
            const q = query(collection(db, SCHOLARSHIP_COLLECTION_NAME), orderBy("registrationDate", "desc"));
            console.log("RegistrationsPage: Firestore query for registrations:", q);
            const querySnapshot = await getDocs(q);
            console.log("RegistrationsPage: Firestore querySnapshot received. Number of docs:", querySnapshot.size);
            
            const fetchedRegistrations: RegistrationDataDisplay[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data() as Omit<RegistrationDataFirestore, 'id'>;
              console.log("RegistrationsPage: Processing doc ID:", doc.id, "Raw Data:", JSON.parse(JSON.stringify(data)));
              let formattedDate = "Invalid Date";
              if (data.registrationDate && typeof data.registrationDate.toDate === 'function') {
                try {
                    formattedDate = data.registrationDate.toDate().toLocaleDateString('en-CA'); // Use a consistent locale like en-CA for YYYY-MM-DD
                } catch (e) {
                    console.error("RegistrationsPage: Error formatting date for doc ID:", doc.id, e, "Raw date:", data.registrationDate);
                    // Keep "Invalid Date" or try a simpler format if toLocaleDateString fails
                     try {
                        const d = data.registrationDate.toDate();
                        formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    } catch (finalError) {
                         console.error("RegistrationsPage: Final attempt to format date failed for doc ID:", doc.id, finalError);
                    }
                }
              } else {
                console.warn("RegistrationsPage: registrationDate is missing or not a Timestamp for doc ID:", doc.id, "Raw value:", data.registrationDate);
                formattedDate = data.registrationDate ? String(data.registrationDate) : "Missing Date";
              }
              fetchedRegistrations.push({
                id: doc.id,
                ...data,
                registrationDate: formattedDate,
              });
            });
            console.log("RegistrationsPage: Fetched and processed registrations:", fetchedRegistrations.length, "items.");
            setRegistrations(fetchedRegistrations);
            setFetchError(null);
          } catch (error: any) {
            console.error("RegistrationsPage: ERROR fetching registrations from Firestore:", {
              collection: SCHOLARSHIP_COLLECTION_NAME,
              message: error.message,
              code: error.code,
              stack: error.stack,
              fullError: error
            });
            setFetchError("Failed to load registrations. Please check your Firebase setup and internet connection. Details in console.");
            setRegistrations([]); 
          } finally {
            setIsLoading(false);
            console.log("RegistrationsPage: Finished fetching registrations. isLoading set to false.");
          }
        };
        fetchRegistrations();
      }
    }
  }, [router, t]); // Added router and t to dependency array

  if (isLoading) {
    console.log("RegistrationsPage: isLoading is true, rendering loading state.");
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  if (!isAuthorized) {
     console.log("RegistrationsPage: Not authorized, rendering access denied message.");
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

  console.log("RegistrationsPage: Rendering main content. Registrations count:", registrations.length, "Fetch error:", fetchError);
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


