
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, UserCircle } from 'lucide-react';
import Image from 'next/image';

// Sample data for toppers. This could be fetched from a database in a real application.
const toppersData = [
  { rank: 1, name: 'Ravi Kumar', score: '385/400', class: 'Class 9', photoUrl: 'https://placehold.co/40x40.png', dataAiHint: 'student avatar' },
  { rank: 2, name: 'Priya Sharma', score: '382/400', class: 'Class 9', photoUrl: 'https://placehold.co/40x40.png', dataAiHint: 'student avatar' },
  { rank: 3, name: 'Amit Singh', score: '290/300', class: 'Class 6', photoUrl: 'https://placehold.co/40x40.png', dataAiHint: 'student avatar' },
  { rank: 4, name: 'Sunita Devi', score: '288/300', class: 'Class 6', photoUrl: 'https://placehold.co/40x40.png', dataAiHint: 'student avatar' },
  { rank: 5, name: 'Mohan Lal', score: '375/400', class: 'Class 9', photoUrl: 'https://placehold.co/40x40.png', dataAiHint: 'student avatar' },
];

export default function ToppersPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl bg-card border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('toppers')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('toppersListDesc') || 'Celebrating the high achievers from our tests.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">{t('rank') || 'Rank'}</TableHead>
                <TableHead>{t('studentName')}</TableHead>
                <TableHead>{t('class')}</TableHead>
                <TableHead className="text-right">{t('score')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toppersData.map((topper) => (
                <TableRow key={topper.rank}>
                  <TableCell className="font-bold text-lg">{topper.rank}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Image src={topper.photoUrl} alt={topper.name} width={32} height={32} className="rounded-full h-8 w-8 object-cover" data-ai-hint={topper.dataAiHint} />
                    {topper.name}
                  </TableCell>
                  <TableCell>{topper.class}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{topper.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
