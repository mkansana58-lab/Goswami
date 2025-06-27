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
import { Loader2, Send, MessagesSquare, ImagePlus, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function GroupChatPage() {
    const { student } = useAuth();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [imageToSend, setImageToSend] = useState<string | null>(null);
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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setImageToSend(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !imageToSend) || !student) return;

        setIsSending(true);
        const messageData: Omit<ChatMessage, 'id' | 'createdAt'> = {
            text: newMessage.trim(),
            userName: student.name,
            userPhotoUrl: student.photoUrl || '',
        };

        if (imageToSend) {
            messageData.imageUrl = imageToSend;
        }

        try {
            await addChatMessage(messageData);
            setNewMessage('');
            setImageToSend(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error("Error sending message:", error);
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
                                        <div className={`max-w-xs md:max-w-md rounded-2xl p-2 ${isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                            {msg.imageUrl && (
                                                <div className="relative aspect-video w-48 rounded-lg overflow-hidden mb-2">
                                                    <Image src={msg.imageUrl} alt="Chat image" layout="fill" objectFit="cover" data-ai-hint="chat message"/>
                                                </div>
                                            )}
                                            {msg.text && <p className="text-sm px-2">{msg.text}</p>}
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
                    <div className="w-full space-y-2">
                        {imageToSend && (
                            <div className="p-2 border-t">
                                <div className="relative w-24 h-24 p-2 border rounded-md bg-muted">
                                    <Image src={imageToSend} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={() => {
                                            setImageToSend(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                <ImagePlus className="h-5 w-5" />
                                <span className="sr-only">Add image</span>
                            </Button>
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <Input
                                type="text"
                                placeholder={t('chatPlaceholder')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isSending}
                                autoComplete="off"
                            />
                            <Button type="submit" disabled={isSending || (newMessage.trim() === '' && !imageToSend)}>
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="sr-only">{t('sendMessage')}</span>
                            </Button>
                        </form>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
