
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkCutoff, type CutoffCheckerOutput } from '@/ai/flows/cutoff-checker-flow';
import { CutoffResultCertificate } from '@/components/cutoff/cutoff-result-certificate';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  examName: z.string().min(3, "Exam name is required"),
  totalMarks: z.coerce.number().min(1, "Total marks are required"),
  obtainedMarks: z.coerce.number().min(0, "Obtained marks are required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CutoffCheckerPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CutoffCheckerOutput | null>(null);
    const [formValues, setFormValues] = useState<FormValues | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);
        setFormValues(values);
        try {
            const aiResult = await checkCutoff(values);
            setResult(aiResult);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get analysis. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (result && formValues && student) {
        return <CutoffResultCertificate 
                    studentName={student.name}
                    examName={formValues.examName}
                    result={result}
                    onBack={() => setResult(null)} 
                />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Scissors className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('cutoffChecker')}</h1>
                <p className="text-muted-foreground">Get an AI-based analysis of your selection chances.</p>
            </div>
            
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Enter Exam Details</CardTitle>
                    <CardDescription>Provide your exam details to get an analysis.</CardDescription>
                </CardHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div><Label htmlFor="examName">Exam Name</Label><Input id="examName" {...form.register('examName')} /><p className="text-destructive text-xs">{form.formState.errors.examName?.message}</p></div>
                        <div><Label htmlFor="totalMarks">Total Marks</Label><Input id="totalMarks" type="number" {...form.register('totalMarks')} /><p className="text-destructive text-xs">{form.formState.errors.totalMarks?.message}</p></div>
                        <div><Label htmlFor="obtainedMarks">Obtained Marks</Label><Input id="obtainedMarks" type="number" {...form.register('obtainedMarks')} /><p className="text-destructive text-xs">{form.formState.errors.obtainedMarks?.message}</p></div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Check My Chances"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
