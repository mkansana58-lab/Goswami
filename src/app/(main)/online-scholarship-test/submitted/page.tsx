
"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TestSubmittedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Card className="max-w-lg text-center p-8">
                <CardHeader>
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Test Submitted Successfully!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Thank you for completing the scholarship test. Your result will be declared on the date announced by the academy. You can review your answers from the Student Portal.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/student-portal">Go to Student Portal</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
