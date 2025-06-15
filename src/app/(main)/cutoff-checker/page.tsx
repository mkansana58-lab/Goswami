
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { predictSelectionChance } from './actions'; // Will create this actions file
import type { PredictSelectionChanceOutput } from '@/ai/flows/predict-selection-chance';
import { Loader2, Award, BarChart3 } from 'lucide-react';

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  examName: z.string().min(3, { message: t('examNameValidation') || "Exam name must be at least 3 characters." }),
  totalMarks: z.coerce.number().positive({ message: t('totalMarksValidation') || "Total marks must be a positive number." }),
  obtainedMarks: z.coerce.number().min(0, { message: t('obtainedMarksValidation') || "Obtained marks cannot be negative." }),
});

type CutoffFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function CutOffCheckerPage() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictSelectionChanceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<CutoffFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      examName: "",
      totalMarks: undefined, // Use undefined for number inputs for better placeholder behavior
      obtainedMarks: undefined,
    },
  });

  const onSubmit: SubmitHandler<CutoffFormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    if (data.obtainedMarks > data.totalMarks) {
        setError(t('obtainedMarksGreaterThanTotalError') || "Obtained marks cannot be greater than total marks.");
        setIsLoading(false);
        return;
    }
    try {
      const response = await predictSelectionChance({ ...data, language });
      if ('error' in response) { // Assuming actions.ts might return an error object
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (e: any) {
      console.error("Error in cut-off checker:", e);
      setError(t('errorOccurred') + (e.message ? `: ${e.message}` : ''));
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <BarChart3 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navCutOffChecker')}</CardTitle>
          <CardDescription className="text-lg">{t('cutOffCheckerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('examNameLabel') || 'Exam Name'}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('examNamePlaceholder') || "e.g., NDA Entrance"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('totalMarksLabel') || 'Total Marks'}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="obtainedMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('obtainedMarksLabel') || 'Obtained Marks'}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 650" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('checkChanceButton') || 'Check My Chances'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="shadow-lg mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-destructive">{t('errorOccurred')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && !error && (
        <Card className="shadow-lg mt-6 border-primary bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
                <Award className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">{t('chanceCertificateTitle') || 'Your Chance Assessment'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-muted/50 p-4 rounded-md shadow-inner">
              <p className="text-lg font-semibold text-secondary-foreground">{t('selectionChance') || 'Selection Chance'}:</p>
              <p className="text-xl md:text-2xl font-bold text-primary py-1">{result.chanceAssessment}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-md shadow-inner">
               <p className="text-lg font-semibold text-secondary-foreground">{t('ourAdvice') || 'Our Advice'}:</p>
              <p className="text-foreground whitespace-pre-wrap">{result.advice}</p>
            </div>
             <div className="mt-4 p-4 border-2 border-dashed border-accent rounded-lg bg-accent/10">
                <p className="text-md italic text-accent-foreground/90">"{result.certificateText}"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add to translations:
// examNameLabel: "Exam Name" (EN/HI)
// examNamePlaceholder: "e.g., NDA Entrance" (EN/HI)
// totalMarksLabel: "Total Marks" (EN/HI)
// obtainedMarksLabel: "Obtained Marks" (EN/HI)
// checkChanceButton: "Check My Chances" (EN/HI)
// chanceCertificateTitle: "Your Chance Assessment" (EN/HI)
// selectionChance: "Selection Chance" (EN/HI)
// ourAdvice: "Our Advice" (EN/HI)
// examNameValidation: "Exam name must be at least 3 characters." (EN/HI)
// totalMarksValidation: "Total marks must be a positive number." (EN/HI)
// obtainedMarksValidation: "Obtained marks cannot be negative." (EN/HI)
// obtainedMarksGreaterThanTotalError: "Obtained marks cannot be greater than total marks." (EN/HI)
