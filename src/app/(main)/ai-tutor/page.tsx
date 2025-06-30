"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { askTutor, type TutorOutput } from '@/ai/flows/tutor-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookCheck, BrainCircuit, BarChart2, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  question: z.string().min(10, { message: "Please ask a more detailed question." }),
});

export default function AiTutorPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tutorResponse, setTutorResponse] = useState<TutorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTutorResponse(null);
    setAudioUrl(null); // Reset audio on new question
    try {
      const response = await askTutor({ question: values.question });
      setTutorResponse(response);
    } catch (error) {
      console.error("Error fetching from AI Tutor:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an unexpected error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleListen = async () => {
    if (!tutorResponse?.answer || isAudioLoading) return;

    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
        const response = await textToSpeech(tutorResponse.answer);
        setAudioUrl(response.media);
    } catch (error) {
        console.error("Error generating audio:", error);
        toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Could not generate audio for this answer.",
        });
    } finally {
        setIsAudioLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">{t('aiTutorTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('aiTutorDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('askYourQuestion')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              placeholder={t('aiTutorPlaceholder')}
              {...form.register('question')}
              className="min-h-[100px]"
              disabled={isLoading}
            />
            {form.formState.errors.question && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.question.message}
              </p>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('aiIsThinking')}
                </>
              ) : (
                t('submitQuestion')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t('aiIsThinking')}</p>
        </Card>
      )}

      {tutorResponse && (
        <div className="space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookCheck /> {t('answer')}
                      </CardTitle>
                      <div className="flex items-center gap-2 pt-2">
                         <Badge variant="secondary" className="flex items-center gap-1">
                            <BrainCircuit className="h-3 w-3" />
                            {t('subject')}: {tutorResponse.subject}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <BarChart2 className="h-3 w-3"/>
                            {t('difficulty')}: {tutorResponse.difficulty}
                        </Badge>
                      </div>
                  </div>
                   <Button onClick={handleListen} variant="outline" size="sm" disabled={isAudioLoading}>
                    {isAudioLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Headphones className="h-4 w-4 mr-2" />
                    )}
                    Listen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{tutorResponse.answer}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> {t('relatedQuestions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-decimal pl-5">
                {tutorResponse.relatedQuestions.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </div>
  );
}
