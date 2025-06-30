
"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Binary, Check, X, BrainCircuit, Users, Globe, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTrueFalseQuestion, type TrueFalseOutput } from '@/ai/flows/true-false-flow';
import { cn } from '@/lib/utils';

type GameState = 'picking_subject' | 'playing' | 'revealed';

const subjects = [
  { name: 'विज्ञान', key: 'Science', icon: Brain },
  { name: 'इतिहास', key: 'History', icon: Users },
  { name: 'भूगोल', key: 'Geography', icon: Globe },
  { name: 'सामान्य ज्ञान', key: 'General Knowledge', icon: BrainCircuit },
];

export default function TrueFalseGamePage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    
    const [gameState, setGameState] = useState<GameState>('picking_subject');
    const [subject, setSubject] = useState<string>('');
    const [questionData, setQuestionData] = useState<TrueFalseOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

    const fetchQuestion = async (selectedSubject: string) => {
        setIsLoading(true);
        setQuestionData(null);
        setUserAnswer(null);
        setGameState('playing');
        try {
            const res = await generateTrueFalseQuestion({ subject: selectedSubject });
            setQuestionData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new question.' });
            setGameState('picking_subject'); // Go back to subject selection on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSubject = (selectedSubject: string) => {
        setSubject(selectedSubject);
        fetchQuestion(selectedSubject);
    };

    const handleAnswer = (answer: boolean) => {
        if (gameState !== 'playing') return;
        setUserAnswer(answer);
        setGameState('revealed');
    };

    const handleNextQuestion = () => {
        fetchQuestion(subject);
    };
    
    const resetGame = () => {
        setGameState('picking_subject');
        setSubject('');
        setQuestionData(null);
        setUserAnswer(null);
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (gameState === 'picking_subject') {
            return (
                <Card className="text-center bg-card/70 backdrop-blur-sm max-w-md mx-auto animate-in fade-in-50">
                    <CardHeader><CardTitle>{t('selectSubject')}</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {subjects.map(s => (
                            <Button key={s.key} onClick={() => handleSelectSubject(s.key)} size="lg" className="h-20 text-base">
                                <s.icon className="mr-2 h-6 w-6" /> {s.name}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            );
        }

        if (questionData) {
            const isCorrect = userAnswer === questionData.isTrue;
            return (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50">
                    <Card className="text-center bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardDescription>{t('subject')}: {subject}</CardDescription>
                            <CardTitle className="text-2xl leading-relaxed">{questionData.statement}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button
                                className={cn("h-24 text-2xl font-bold transition-all duration-300",
                                    gameState === 'revealed' && questionData.isTrue && "bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg",
                                    gameState === 'revealed' && userAnswer === true && !isCorrect && "bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg"
                                )}
                                onClick={() => handleAnswer(true)}
                                disabled={gameState === 'revealed'}
                            >
                                <Check className="mr-4 h-8 w-8" /> {t('trueText')}
                            </Button>
                             <Button
                                className={cn("h-24 text-2xl font-bold transition-all duration-300",
                                    gameState === 'revealed' && !questionData.isTrue && "bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg",
                                    gameState === 'revealed' && userAnswer === false && !isCorrect && "bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg"
                                )}
                                onClick={() => handleAnswer(false)}
                                disabled={gameState === 'revealed'}
                            >
                                <X className="mr-4 h-8 w-8" /> {t('falseText')}
                            </Button>
                        </CardContent>
                    </Card>

                    {gameState === 'revealed' && (
                        <Card className="text-center animate-in fade-in-50 bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className={cn("text-3xl", isCorrect ? "text-green-400" : "text-destructive")}>
                                    {isCorrect ? t('correct') : t('incorrect')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{questionData.explanation}</p>
                                <div className="flex justify-center gap-4">
                                    <Button onClick={handleNextQuestion} size="lg">{t('nextQuestion')}</Button>
                                    <Button onClick={resetGame} size="lg" variant="outline">Choose Subject</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            );
        }
        
        return null;
    }


    return (
        <div className="space-y-6">
            <div className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="text-center">
                <Binary className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('trueFalseGame')}</h1>
                <p className="text-muted-foreground">{t('trueFalseGameDescription')}</p>
            </div>
            
            {renderContent()}
        </div>
    );
}
