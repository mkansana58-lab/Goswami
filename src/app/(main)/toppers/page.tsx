
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Loader2 } from "lucide-react";
import { getTestResults, type TestResultData } from '@/lib/firebase';

export default function ToppersPage() {
    const { t } = useLanguage();
    const [toppers, setToppers] = useState<TestResultData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchToppers = async () => {
            setIsLoading(true);
            try {
                const results = await getTestResults();
                setToppers(results);
            } catch (error) {
                console.error("Failed to fetch toppers:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchToppers();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Trophy className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('toppersList')}</h1>
                <p className="text-muted-foreground">Students who have excelled in our tests.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t('toppersList')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : toppers.length === 0 ? (
                        <p className="text-center text-muted-foreground">No topper data available yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">{t('rank')}</TableHead>
                                    <TableHead>{t('studentName')}</TableHead>
                                    <TableHead>{t('testName')}</TableHead>
                                    <TableHead className="text-right">{t('score')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {toppers.map((topper, index) => (
                                    <TableRow key={topper.id}>
                                        <TableCell className="font-bold text-lg text-primary">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${topper.studentName.substring(0,2)}`} alt={topper.studentName} />
                                                    <AvatarFallback>{topper.studentName.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{topper.studentName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{topper.testName}</TableCell>
                                        <TableCell className="text-right font-semibold">{topper.score}/{topper.totalQuestions} ({topper.percentage.toFixed(2)}%)</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
