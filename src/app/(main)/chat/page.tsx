
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navChat')}</CardTitle>
          <CardDescription className="text-lg">{t('chatDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="border rounded-lg p-4 h-96 overflow-y-auto flex flex-col space-y-2 bg-muted/30">
            {/* Placeholder chat messages */}
            <div className="p-2 rounded-md bg-primary text-primary-foreground self-start max-w-xs">शिक्षक: कल की क्लास के लिए तैयार हैं?</div>
            <div className="p-2 rounded-md bg-secondary text-secondary-foreground self-end max-w-xs">आप: जी हाँ सर!</div>
            <div className="p-2 rounded-md bg-primary text-primary-foreground self-start max-w-xs">शिक्षक: बहुत बढ़िया!</div>
          </div>
          <div className="flex gap-2">
            <Input placeholder={t('typeYourMessage') || "अपना संदेश लिखें..."} className="flex-grow"/>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">{t('sendButton') || "भेजें"}</Button>
          </div>
          <p className="text-center text-sm text-muted-foreground pt-4">
            यह फीचर आपको शिक्षकों और साथी छात्रों से जुड़ने में मदद करेगा। अभी यह प्रोटोटाइप है।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add 'typeYourMessage' and 'sendButton' to translations if needed.
