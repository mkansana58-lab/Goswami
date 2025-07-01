
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookCheck, BrainCircuit, BarChart2, Headphones, ImagePlus, X, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUrl } from '@/lib/utils';
import Image from 'next/image';

const formSchema = z.object({
  question: z.string().min(10, { message: "Please ask a more detailed question." }),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiTutorPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tutorResponse, setTutorResponse] = useState<TutorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio autoplay prevented by browser."));
    }
  }, [audioUrl]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const dataUrl = await fileToDataUrl(file);
            setImagePreview(dataUrl);
            form.setValue('image', dataUrl);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Image Error', description: err.message });
        }
    }
  }

  const clearImage = () => {
    setImagePreview(null);
    form.setValue('image', undefined);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setIsAudioLoading(true);
    setTutorResponse(null);
    setAudioUrl(null);
    
    try {
      const response = await askTutor({ question: values.question, imageDataUri: values.image });
      
      if (response && response.answer) {
        setTutorResponse(response);
        
        // Try to generate audio. This is non-critical.
        try {
          const audioResponse = await textToSpeech(response.answer);
          setAudioUrl(audioResponse.media);
        } catch (audioError) {
          console.error("Error generating audio:", audioError);
          toast({
              variant: "default",
              title: "Audio Not Available",
              description: "Could not generate audio for this answer, but you can still read it.",
          });
        }
      } else {
        throw new Error("The AI tutor did not provide a valid answer. Please try rephrasing your question.");
      }

    } catch (error: any) {
      console.error("Error fetching from AI Tutor:", error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: error.message || "There was an unexpected error. Please try again.",
      });
      setTutorResponse(null);
    } finally {
      setIsLoading(false);
      setIsAudioLoading(false);
    }
  }

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

             <div className="space-y-2">
                <Label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                    <ImagePlus className="h-5 w-5" /> Attach an image (optional)
                </Label>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} disabled={isLoading}/>
                {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg border-2 border-dashed p-1">
                        <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" className="rounded"/>
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7 rounded-full z-10" onClick={clearImage}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
             </div>

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

      {(isLoading || isAudioLoading) && (
         <Card className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
                {isLoading ? t('aiIsThinking') : 'Generating audio...'}
            </p>
        </Card>
      )}

      {tutorResponse && !isLoading && !isAudioLoading && (
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
                   {audioUrl && (
                        <Button onClick={() => audioRef.current?.play()} variant="outline" size="sm">
                            <Volume2 className="h-4 w-4 mr-2" />
                            Replay
                        </Button>
                   )}
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
