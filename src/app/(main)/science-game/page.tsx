
"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, X, Atom } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateScienceTask, type ScienceGameOutput } from '@/ai/flows/science-game-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings, getAppConfig } from '@/lib/firebase';

export default function ScienceGamePage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [taskData, setTaskData] = useState<ScienceGameOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userOrder, setUserOrder] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [correctStreak, setCorrectStreak] = useState(0);
    const [backgroundUrl, setBackgroundUrl] = useState('');

    useEffect(() => {
        getAppConfig().then(config => {
            if (config.scienceGameBgUrl) {
                setBackgroundUrl(config.scienceGameBgUrl);
            }
            fetchTask();
        });
    }, []);

    const fetchTask = async () => {
        setIsLoading(true);
        setTaskData(null);
        setUserOrder([]);
        setIsRevealed(false);
        try {
            const res = await generateScienceTask();
            setTaskData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new task.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStepClick = (step: string) => {
        if (isRevealed || userOrder.includes(step)) return;
        setUserOrder(prev => [...prev, step]);
    };

    const handleCheckOrder = async () => {
        if (!taskData || !student) return;
        
        const isCorrect = JSON.stringify(userOrder) === JSON.stringify(taskData.correctOrder);
        setIsRevealed(true);
        
        if (isCorrect) {
            toast({ title: "Correct Order!" });
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);

            if (newStreak > 0 && newStreak % 5 === 0) {
                const points = 5000;
                await addQuizWinnings(student.name, points);
                await refreshStudentData(student.name);
                toast({ title: `Amazing! 5 in a row! You won ${points} points!` });
            }
        } else {
            toast({ variant: 'destructive', title: "Incorrect Order" });
            setCorrectStreak(0);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (taskData) {
            return (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50">
                    <Card className="text-center bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl leading-relaxed">{taskData.task}</CardTitle>
                            <CardDescription>Arrange the steps in the correct order by clicking on them.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Unselected Steps */}
                            <div className="grid grid-cols-2 gap-4">
                                {taskData.steps.filter(s => !userOrder.includes(s)).map((step, i) => (
                                    <Button key={i} variant="outline" size="lg" className="h-auto py-3 text-base justify-center w-full" onClick={() => handleStepClick(step)}>{step}</Button>
                                ))}
                            </div>

                            <Separator />
                            
                            {/* Selected Steps */}
                            <div className="min-h-[12rem] bg-background/50 p-4 rounded-lg border-dashed border-2 space-y-2">
                                <h3 className="font-semibold text-center text-muted-foreground">Your Answer (in order)</h3>
                                {userOrder.map((step, i) => (
                                    <div key={i} className="bg-accent text-accent-foreground p-2 rounded-md flex items-center justify-between">
                                        <span>{i + 1}. {step}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {isRevealed && (
                        <Card className="text-center animate-in fade-in-50 bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>The Correct Order was:</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                {taskData.correctOrder.map((step, i) => (
                                     <div key={i} className="bg-green-500/10 text-green-300 p-2 rounded-md font-semibold">
                                        {i + 1}. {step}
                                    </div>
                                ))}
                                <Button onClick={fetchTask} size="lg" className="mt-4">Next Task</Button>
                            </CardContent>
                        </Card>
                    )}

                    {!isRevealed && (
                         <div className="flex justify-center">
                            <Button onClick={handleCheckOrder} size="lg" disabled={userOrder.length !== 4}>Check My Answer</Button>
                        </div>
                    )}
                </div>
            );
        }
        
        return null;
    }

    return (
        <div className="space-y-6 relative h-full">
             <div 
                className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-slate-950 bg-cover bg-center"
                style={{ backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)" }}
            >
                 <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="text-center">
                <Atom className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">विज्ञान गेम</h1>
                <p className="text-muted-foreground">Put your science knowledge to the test!</p>
            </div>
            
            {renderContent()}
        </div>
    );
}

const Separator = () => <div className="border-b border-dashed my-4"></div>;
