
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { db, getStory, addStoryLine, createNewStory, type Story, type StoryLine } from '@/lib/firebase';
import { continueStory, startStory } from '@/ai/flows/story-weaver-flow';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Feather, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

export default function StoryWeaverPage() {
    const { student } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    
    const [story, setStory] = useState<Story | null>(null);
    const [nextLine, setNextLine] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!db) return;
        const storyRef = doc(db, "stories", "main-story");
        const unsubscribe = onSnapshot(storyRef, (doc) => {
            if (doc.exists()) {
                setStory({ id: doc.id, ...doc.data() } as Story);
            } else {
                setStory(null); // Story doesn't exist yet
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching story:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load the story." });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollAreaRef.current) {
            const scrollableView = scrollAreaRef.current.querySelector('div');
            if (scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
            }
        }
    }, [story]);
    
    const handleStartStory = async () => {
        if (!student) return;
        setIsSubmitting(true);
        try {
            const result = await startStory();
            const firstLine: StoryLine = {
                text: result.nextLine,
                author: 'AI',
                createdAt: Timestamp.now()
            };
            await createNewStory(firstLine);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "AI could not start a new story." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddLine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nextLine.trim() === '' || !student) return;

        setIsSubmitting(true);
        const newLine: StoryLine = {
            text: nextLine,
            author: student.name,
            createdAt: Timestamp.now(),
        };

        try {
            await addStoryLine(newLine);
            setNextLine('');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not add your line to the story." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAiContinue = async () => {
        if (!story || !student) return;
        setIsSubmitting(true);
        
        try {
            const currentStoryText = story.lines.map(l => l.text).join(' ');
            const result = await continueStory({ currentStory: currentStoryText });
            
            const aiLine: StoryLine = {
                text: result.nextLine,
                author: 'AI',
                createdAt: Timestamp.now()
            };
            await addStoryLine(aiLine);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "AI could not continue the story." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="text-center mb-6">
                <Feather className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">AI कहानी-कार</h1>
                <p className="text-muted-foreground">मिलकर एक मज़ेदार कहानी बनाएँ!</p>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>{story?.title || "कहानी शुरू होने वाली है..."}</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : story && story.lines.length > 0 ? (
                            story.lines.map((line, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Avatar>
                                        <AvatarFallback>{line.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{line.author}</p>
                                        <p className="text-foreground">{line.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10 space-y-4">
                                <p>अभी तक कोई कहानी नहीं है।</p>
                                <Button onClick={handleStartStory} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                    AI से कहानी शुरू कराएँ
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </ScrollArea>
                 {story && (
                     <div className="p-4 border-t space-y-2">
                        <form onSubmit={handleAddLine} className="flex gap-2">
                            <Input
                                placeholder="कहानी को आगे बढ़ाएँ..."
                                value={nextLine}
                                onChange={(e) => setNextLine(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <Button type="submit" size="icon" disabled={isSubmitting || nextLine.trim() === ''}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                         <Button variant="outline" className="w-full" onClick={handleAiContinue} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            समझ नहीं आ रहा? AI से मदद लें
                        </Button>
                    </div>
                 )}
            </Card>
        </div>
    );
}
