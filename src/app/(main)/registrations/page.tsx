
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

// Mock data for scholarship registrations
// In a real application, this data would be fetched from a database.
const mockRegistrations = [
  { id: 'reg001', studentName: "Amit Kumar", emailAddress: "amit.k@example.com", phoneNumber: "9876543210", currentClass: "10th", address: "123, Main Street, Delhi", registrationDate: "2024-07-15" },
  { id: 'reg002', studentName: "Priya Sharma", emailAddress: "priya.s@example.com", phoneNumber: "9123456780", currentClass: "9th", address: "45, Sector 5, Gurgaon", registrationDate: "2024-07-16" },
  { id: 'reg003', studentName: "Rajesh Singh", emailAddress: "rajesh.s@example.com", phoneNumber: "9998887770", currentClass: "11th", address: "78, Civil Lines, Jaipur", registrationDate: "2024-07-17" },
  { id: 'reg004', studentName: "Sunita Devi", emailAddress: "sunita.d@example.com", phoneNumber: "9000011122", currentClass: "10th", address: "Plot 11, Rohini, New Delhi", registrationDate: "2024-07-18" },
];

// NOTE: This is a placeholder for actual admin authentication.
// In a real application, this page would be protected and only accessible to admins.
const isAdmin = true; 

export default function RegistrationsPage() {
  const { t } = useLanguage();

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
          {mockRegistrations.length > 0 ? (
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
                {mockRegistrations.map((reg) => (
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
        Note: This page displays mock data for demonstration purposes. True admin functionality and data storage require backend development.
      </p>
    </div>
  );
}
