
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { db, addChatMessage, type ChatMessage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, MessagesSquare, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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
        const q = query(collection(db, "chatMessages"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ChatMessage[] = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching chat messages:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: 'destructive', title: 'Image too large', description: 'Please select an image smaller than 2MB.' });
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
            imageUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(imageFile);
            });
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
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-2xl mx-auto">
             <div className="flex flex-col items-center text-center mb-6">
                <MessagesSquare className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('groupChatTitle')}</h1>
                <p className="text-muted-foreground">{t('groupChatDescription')}</p>
            </div>
            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.userPhotoUrl || `https://placehold.co/40x40.png?text=${msg.userName[0]}`} />
                                            <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                        {!isCurrentUser && <p className="text-xs text-muted-foreground px-1">{msg.userName}</p>}
                                        <div className={`max-w-xs md:max-w-md rounded-2xl p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                            {msg.imageUrl && (
                                                <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden mt-2">
                                                    <Image src={msg.imageUrl} alt="Chat image" layout="fill" objectFit="cover" data-ai-hint="chat message"/>
                                                </div>
                                            )}
                                        </div>
                                         <p className="text-xs text-muted-foreground px-1 mt-1">{msg.createdAt ? format(msg.createdAt.toDate(), 'p') : ''}</p>
                                    </div>
                                    {isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={student?.photoUrl || `https://placehold.co/40x40.png?text=${student.name[0]}`} />
                                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="p-2 border-t">
                    <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2">
                         {imagePreview && (
                            <div className="relative w-24 h-24 p-2 border rounded-md self-start">
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
                        <div className="w-full flex items-center gap-2">
                             <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach image</span>
                            </Button>
                            <Input
                                type="text"
                                placeholder={t('chatPlaceholder')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isSending}
                                autoComplete="off"
                            />
                            <Button type="submit" disabled={isSending || (newMessage.trim() === '' && !imageFile)}>
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="sr-only">{t('sendMessage')}</span>
                            </Button>
                        </div>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
