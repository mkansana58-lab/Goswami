
"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Send, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const CHAT_COLLECTION_NAME = 'chatMessages';
const USER_ID_KEY = 'goSwamiChatUserId';
const DISPLAY_NAME_KEY = 'goSwamiChatDisplayName';

interface ChatMessage {
  id: string; 
  text: string;
  userId: string;
  displayName: string;
  timestamp: Timestamp; 
}

export default function ChatPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');
  const [tempDisplayName, setTempDisplayName] = useState<string>('');
  const [isDisplayNameSet, setIsDisplayNameSet] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      console.log("ChatPage: Client detected. Initializing user ID and display name...");
      let userId = localStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem(USER_ID_KEY, userId);
        console.log("ChatPage: New user ID generated and stored:", userId);
      } else {
        console.log("ChatPage: Existing user ID found:", userId);
      }
      setCurrentUserId(userId);

      const storedDisplayName = localStorage.getItem(DISPLAY_NAME_KEY);
      if (storedDisplayName) {
        setCurrentDisplayName(storedDisplayName);
        setTempDisplayName(storedDisplayName);
        setIsDisplayNameSet(true);
        console.log("ChatPage: Stored display name found:", storedDisplayName);
      } else {
        setCurrentDisplayName(t('anonymousUser') || 'Anonymous');
        console.log("ChatPage: No stored display name, using default.");
      }
    }
  }, [isClient, t]);

  useEffect(() => {
    if (!isClient || !currentUserId) {
      console.log("ChatPage: Firestore listener not attached - isClient:", isClient, "currentUserId:", currentUserId);
      return;
    }

    console.log("ChatPage: Setting up Firestore onSnapshot listener for collection:", CHAT_COLLECTION_NAME);
    const q = query(collection(db, CHAT_COLLECTION_NAME), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      console.log("ChatPage: onSnapshot triggered. Snapshot size:", querySnapshot.size, "Docs found:", querySnapshot.docs.length);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("ChatPage: Fetched message doc ID:", doc.id, "Data:", data, "Timestamp type:", typeof data.timestamp, "Is Firestore Timestamp:", data.timestamp instanceof Timestamp);
        fetchedMessages.push({ id: doc.id, ...data } as ChatMessage);
      });
      setMessages(fetchedMessages);
      console.log("ChatPage: Messages state updated with", fetchedMessages.length, "messages.");
    }, (error) => {
      console.error("ChatPage: Error fetching chat messages from Firestore (onSnapshot):", { message: error.message, code: error.code, stack: error.stack });
      toast({
        title: t('errorOccurred'),
        description: t('fetchErrorDetails') + (error.message ? ` (${error.message})` : ''),
        variant: "destructive",
      });
    });

    return () => {
      console.log("ChatPage: Unsubscribing from Firestore onSnapshot listener.");
      unsubscribe();
    };
  }, [isClient, currentUserId, t, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSetDisplayName = () => {
    if (tempDisplayName.trim() === '') {
      toast({ title: t('errorOccurred'), description: t('displayNameCannotBeEmpty') || "Display name cannot be empty.", variant: "destructive" });
      return;
    }
    setCurrentDisplayName(tempDisplayName.trim());
    localStorage.setItem(DISPLAY_NAME_KEY, tempDisplayName.trim());
    setIsDisplayNameSet(true);
    console.log("ChatPage: Display name set to:", tempDisplayName.trim());
    toast({ title: t('displayNameSetSuccess') || "Display name updated!"});
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') {
        toast({ title: t('errorOccurred'), description: t('messageCannotBeEmpty') || "Message cannot be empty.", variant: "destructive" });
        return;
    }
    if (!isDisplayNameSet && !currentDisplayName) {
        toast({ title: t('errorOccurred'), description: t('setDisplayNamePrompt') || "Please set your display name first.", variant: "destructive"});
        return;
    }

    console.log("ChatPage: Attempting to send message...");
    const newMessagePayload = {
      text: inputValue.trim(),
      userId: currentUserId,
      displayName: currentDisplayName || (t('anonymousUser') || 'Anonymous'),
      timestamp: serverTimestamp()
    };
    console.log("ChatPage: New message payload:", newMessagePayload);

    try {
      const docRef = await addDoc(collection(db, CHAT_COLLECTION_NAME), newMessagePayload);
      console.log("ChatPage: Message sent to Firestore successfully. Document ID:", docRef.id);
      setInputValue('');
    } catch (error: any) {
      console.error("ChatPage: Error sending message to Firestore (addDoc):", { message: error.message, code: error.code, details: error.details, stack: error.stack, fullError: error });
      toast({
        title: t('errorOccurred'),
        description: `${t('saveErrorDetails') || "Could not send message."} ${error.message ? `(${error.message})` : 'Please check console and Firebase setup.'}`,
        variant: "destructive",
      });
    }
    console.log("ChatPage: Finished send message attempt.");
  };

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 flex flex-col h-[calc(100vh-10rem)]">
      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="text-center pb-4 border-b">
          <div className="flex justify-center mb-2">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary">{t('navChat')}</CardTitle>
          <CardDescription className="text-md">{t('chatRoomDesc') || "Join the conversation! Messages are shared with everyone."}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          {!isDisplayNameSet && isClient && (
            <div className="p-4 border-b bg-muted/50">
              <Label htmlFor="displayNameInput" className="text-sm font-medium">{t('displayNameLabel') || "Set Your Display Name:"}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="displayNameInput"
                  placeholder={t('displayNamePlaceholder') || "Enter your name"}
                  value={tempDisplayName}
                  onChange={(e) => setTempDisplayName(e.target.value)}
                  className="flex-grow text-sm"
                />
                <Button onClick={handleSetDisplayName} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {t('setDisplayNameButton') || "Set Name"}
                </Button>
              </div>
            </div>
          )}
           {isDisplayNameSet && isClient && (
             <div className="p-2 text-xs text-center text-muted-foreground border-b">
                {t('chattingAs') || "Chatting as:"} <strong className="text-primary">{currentDisplayName}</strong>
                <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-xs" onClick={() => setIsDisplayNameSet(false)}>{t('changeNameButton') || "(Change)"}</Button>
            </div>
           )}

          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col mb-3 ${
                  msg.userId === currentUserId ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-md break-words ${
                    msg.userId === currentUserId
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.userId !== currentUserId && (
                    <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.displayName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {msg.timestamp ? formatTimestamp(msg.timestamp.toDate()) : t('sending') || 'Sending...'}
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
                placeholder={isDisplayNameSet ? (t('typeYourMessage') || "अपना संदेश लिखें...") : (t('setDisplayNameFirst') || "Set your name to chat")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(isDisplayNameSet) handleSendMessage();
                  }
                }}
                className="flex-grow text-sm"
                disabled={!isDisplayNameSet && isClient}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                aria-label={t('sendButton') || "भेजें"}
                disabled={!isDisplayNameSet && isClient}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

    