
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { addChatMessage, type ChatMessage, db } from '@/lib/firebase';
import { ref, query, orderByChild, onValue } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, MessagesSquare, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUrl } from '@/lib/utils';

export default function GroupChatPage() {
    const { student } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            if (!db) {
                console.error("Realtime DB not available");
                setIsLoading(false);
                return;
            }
            const messagesRef = ref(db, "chatMessages");
            const q = query(messagesRef, orderByChild("createdAt"));
            const unsubscribe = onValue(q, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const msgs: ChatMessage[] = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setMessages(msgs);
                } else {
                    setMessages([]);
                }
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching chat messages:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } catch(e) {
            console.error("Firebase not available", e);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                toast({ variant: 'destructive', title: 'Image too large', description: 'Please select an image smaller than 1MB.' });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const clearImageSelection = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !imageFile) || !student) return;

        setIsSending(true);
        let imageUrl: string | undefined = undefined;

        if (imageFile) {
            try {
                imageUrl = await fileToDataUrl(imageFile);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Image Error", description: error.message });
                setIsSending(false);
                return;
            }
        }
        
        const messageData: Omit<ChatMessage, 'id' | 'createdAt'> = {
            text: newMessage.trim(),
            userName: student.name,
            userPhotoUrl: student.photoUrl || '',
            imageUrl: imageUrl,
        };

        try {
            await addChatMessage(messageData);
            setNewMessage('');
            clearImageSelection();
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-card rounded-xl border">
             <div className="flex items-center gap-3 p-3 border-b bg-card">
                <MessagesSquare className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-xl font-bold text-primary">{t('groupChatTitle')}</h1>
                    <p className="text-muted-foreground text-xs">{t('groupChatDescription')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                 ) : (
                     messages.map((msg) => {
                        const isCurrentUser = msg.userName === student?.name;
                        return (
                             <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {!isCurrentUser && (
                                    <Avatar className="h-8 w-8 self-end">
                                        <AvatarImage src={msg.userPhotoUrl || `https://placehold.co/40x40.png?text=${msg.userName[0]}`} />
                                        <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                    {!isCurrentUser && <p className="text-xs text-muted-foreground px-2">{msg.userName}</p>}
                                    <div className={`rounded-xl p-2 px-3 shadow-sm ${isCurrentUser ? 'bg-primary/90 text-primary-foreground rounded-br-none' : 'bg-background text-foreground rounded-bl-none'}`}>
                                        {msg.imageUrl && (
                                            <div className="max-w-xs mb-1">
                                                <Image
                                                    src={msg.imageUrl}
                                                    alt="Chat image"
                                                    width={320}
                                                    height={240}
                                                    className="h-auto w-full rounded-lg object-cover"
                                                    data-ai-hint="chat message"
                                                />
                                            </div>
                                        )}
                                        {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                    </div>
                                     <p className="text-xs text-muted-foreground px-1 mt-1">{msg.createdAt ? format(new Date(msg.createdAt), 'p') : ''}</p>
                                </div>
                            </div>
                        );
                     })
                 )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-2 border-t bg-card">
                 {imagePreview && (
                    <div className="relative w-24 h-24 p-2 border rounded-md self-start mb-2 bg-background/50">
                        <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                            onClick={clearImageSelection}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            placeholder={t('chatPlaceholder')}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isSending}
                            autoComplete="off"
                            className="rounded-full pl-4 pr-12 h-11 bg-background"
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Attach image</span>
                        </Button>
                         <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <Button type="submit" size="icon" className="rounded-full h-11 w-11 shrink-0" disabled={isSending || (newMessage.trim() === '' && !imageFile)}>
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        <span className="sr-only">{t('sendMessage')}</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
