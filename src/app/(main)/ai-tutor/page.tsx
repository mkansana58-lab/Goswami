
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getDifficultySuggestion } from './actions';
import type { SuggestDifficultyLevelOutput } from '@/ai/flows/suggest-difficulty-level';
import { Loader2, Lightbulb, CheckSquare } from 'lucide-react'; // Added icons

const formSchemaDefinition = (t: (key: any) => string) => z.object({
  problemText: z.string().min(10, { message: t('problemTextValidation') || "Problem text must be at least 10 characters." }),
});

type AITutorFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function AITutorPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SuggestDifficultyLevelOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<AITutorFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      problemText: "",
    },
  });

  const onSubmit: SubmitHandler<AITutorFormValues> = async (data) => {
    setIsLoading(true);
    setAiResult(null);
    setAiError(null);
    const result = await getDifficultySuggestion({ problemText: data.problemText });
    if ('error' in result) {
      setAiError(result.error);
      setAiResult(null); // Ensure no partial old result is shown
    } else {
      setAiResult(result);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('aiTutorTitle')}</CardTitle>
          <CardDescription>{t('aiTutorDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="problemText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('problemText') || 'Practice Problem'}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('problemTextPlaceholder')}
                        {...field}
                        rows={8}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-14" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('assessDifficulty')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {aiResult && !aiError && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Lightbulb className="mr-2 h-7 w-7 text-accent" /> {t('aiAssessment') || 'AI Assessment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-foreground">{t('difficultyLevel')}:</h3>
              <p className="text-foreground bg-muted/50 p-3 rounded-md">{aiResult.difficultyLevel}</p>
            </div>
            {aiResult.solution && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5 text-green-600"/> {t('solutionLabel') || 'Solution'}:
                </h3>
                <p className="text-foreground bg-green-500/10 p-3 rounded-md whitespace-pre-wrap border border-green-500/30">{aiResult.solution}</p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-secondary-foreground">{t('feedback')}:</h3>
              <p className="text-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{aiResult.feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiError && (
        <Card className="shadow-lg mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-destructive">{t('errorOccurred')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{aiError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add these keys to translations.ts
// problemTextValidation: "Problem text must be at least 10 characters."
// problemText: "Practice Problem"
// aiAssessment: "AI Assessment"
// solutionLabel: "Solution" (EN/HI)
