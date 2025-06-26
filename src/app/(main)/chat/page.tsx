
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { predictSelectionChance } from './actions'; // Re-using action file for new chat flow
import type { ChatResponse, ChatMessage } from '@/ai/flows/predict-selection-chance'; // Re-using types for new chat flow

export default function AIChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<{ prompt: string }>();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<{ prompt: string }> = async (data) => {
    const userMessage: ChatMessage = { role: 'user', content: data.prompt };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    reset();

    try {
      const result = await predictSelectionChance({ prompt: data.prompt, photoDataUrl: photoDataUrl || undefined });
      if ('error' in result) {
        const errorMessage: ChatMessage = { role: 'model', content: result.error };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const modelMessage: ChatMessage = { role: 'model', content: result.response };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = { role: 'model', content: t('errorOccurred') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPhotoDataUrl(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('aiChat')}</CardTitle>
          <CardDescription>{t('aiChatDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && (
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center w-full gap-2">
            <Input {...register('prompt')} placeholder={t('typeYourQuestion')} className="flex-1" disabled={isLoading} />
             <label htmlFor="photo-upload" className="cursor-pointer">
                <Button type="button" variant="ghost" size="icon" asChild>
                    <div>
                        <Paperclip className="h-5 w-5" />
                        <input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload}/>
                    </div>
                </Button>
            </label>
            <Button type="submit" disabled={isLoading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      {photoDataUrl && <p className="text-xs text-center text-muted-foreground mt-2">{t('imageAttached')}</p>}
    </div>
  );
}
