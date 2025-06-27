
"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

// Placeholder data for toppers
const toppersData = [
  { rank: 1, name: "Rohan Sharma", score: "195/200", avatar: "https://placehold.co/40x40.png?text=RS", test: "RMS Mock Test - Class 9" },
  { rank: 2, name: "Priya Singh", score: "170/175", avatar: "https://placehold.co/40x40.png?text=PS", test: "RMS Mock Test - Class 6" },
  { rank: 3, name: "Amit Kumar", score: "75/80", avatar: "https://placehold.co/40x40.png?text=AK", test: "JNV Mock Test - Class 6" },
  { rank: 4, name: "Sneha Patel", score: "188/200", avatar: "https://placehold.co/40x40.png?text=SP", test: "RMS Mock Test - Class 9" },
  { rank: 5, name: "Vikram Rathore", score: "165/175", avatar: "https://placehold.co/40x40.png?text=VR", test: "RMS Mock Test - Class 6" },
];

export default function ToppersPage() {
    const { t } = useLanguage();

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
                            {toppersData.map((topper) => (
                                <TableRow key={topper.rank}>
                                    <TableCell className="font-bold text-lg text-primary">{topper.rank}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={topper.avatar} alt={topper.name} />
                                                <AvatarFallback>{topper.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{topper.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{topper.test}</TableCell>
                                    <TableCell className="text-right font-semibold">{topper.score}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
