
"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const CHAT_MESSAGES_STORAGE_KEY = 'goSwamiChatMessages';

export default function ChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedMessages = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error("Error parsing chat messages from localStorage:", error);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isClient]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputValue.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    // Simulate bot reply
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        text: t('chatPlaceholderBotReply') || "Thanks for your message! This is a simulated reply.",
        sender: 'bot',
        timestamp: Date.now() + 1,
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    }, 1000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 flex flex-col h-[calc(100vh-10rem)]">
      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="text-center pb-4 border-b">
          <div className="flex justify-center mb-2">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary">{t('navChat')}</CardTitle>
          <CardDescription className="text-md">{t('chatDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col mb-3 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))}
            {messages.length === 0 && isClient && (
              <p className="text-center text-muted-foreground py-10">{t('chatStartConversation') || "Type a message to start the conversation."}</p>
            )}
          </ScrollArea>
          <div className="border-t p-4 bg-background">
            <div className="flex gap-2 items-center">
              <Input
                placeholder={t('typeYourMessage') || "अपना संदेश लिखें..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-grow text-sm"
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                aria-label={t('sendButton') || "भेजें"}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
       <p className="text-center text-xs text-muted-foreground pt-2">
         {t('chatSimulationNote') || "Note: This is a simulated chat. Messages are stored locally in your browser."}
      </p>
    </div>
  );
}

// Add these keys to translations.ts if they don't exist:
// chatPlaceholderBotReply: "Thanks for your message! This is a simulated reply." (EN)
// chatPlaceholderBotReply: "आपके संदेश के लिए धन्यवाद! यह एक नकली उत्तर है।" (HI)
// chatStartConversation: "Type a message to start the conversation." (EN)
// chatStartConversation: "बातचीत शुरू करने के लिए एक संदेश लिखें।" (HI)
// chatSimulationNote: "Note: This is a simulated chat. Messages are stored locally in your browser." (EN)
// chatSimulationNote: "ध्यान दें: यह एक नकली चैट है। संदेश आपके ब्राउज़र में स्थानीय रूप से संग्रहीत होते हैं।" (HI)
