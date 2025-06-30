
"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, X, Rocket, Sparkles, Paintbrush, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFestivalQuestion, type FestivalQuizOutput } from '@/ai/flows/festival-quiz-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings } from '@/lib/firebase';

type GameState = 'picking_festival' | 'playing' | 'revealed';
type Festival = 'Diwali' | 'Holi';

const festivals = [
  { name: 'दिवाली', key: 'Diwali', icon: Flame, color: "bg-amber-500 hover:bg-amber-600" },
  { name: 'होली', key: 'Holi', icon: Paintbrush, color: "bg-pink-500 hover:bg-pink-600" },
];

export default function FestivalQuizPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [gameState, setGameState] = useState<GameState>('picking_festival');
    const [festival, setFestival] = useState<Festival | null>(null);
    const [questionData, setQuestionData] = useState<FestivalQuizOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const fetchQuestion = async (selectedFestival: Festival) => {
        setIsLoading(true);
        setQuestionData(null);
        setUserAnswer(null);
        setGameState('playing');
        try {
            const res = await generateFestivalQuestion({ festival: selectedFestival });
            setQuestionData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new question.' });
            setGameState('picking_festival');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectFestival = (selectedFestival: Festival) => {
        setFestival(selectedFestival);
        fetchQuestion(selectedFestival);
    };

    const handleAnswer = async (answer: string) => {
        if (gameState !== 'playing' || !questionData || !student) return;
        setUserAnswer(answer);
        setGameState('revealed');
        
        if (answer === questionData.answer) {
            const newScore = score + 100;
            setScore(newScore);
            try {
                await addQuizWinnings(student.name, 100);
                await refreshStudentData(student.name);
                toast({ title: "Correct!", description: "+100 points added to your winnings!" });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error saving points' });
            }
        }
    };

    const handleNextQuestion = () => {
        if (!festival) return;
        fetchQuestion(festival);
    };
    
    const resetGame = () => {
        setGameState('picking_festival');
        setFestival(null);
        setQuestionData(null);
        setUserAnswer(null);
        setScore(0);
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (gameState === 'picking_festival') {
            return (
                <Card className="text-center bg-card/70 backdrop-blur-sm max-w-md mx-auto animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>एक त्योहार चुनें</CardTitle>
                        <CardDescription>Select a festival to start the quiz</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {festivals.map(f => (
                            <Button key={f.key} onClick={() => handleSelectFestival(f.key as Festival)} size="lg" className={cn("h-24 text-lg flex-col gap-2", f.color)}>
                                <f.icon className="h-8 w-8" /> {f.name}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            );
        }

        if (questionData) {
            const isCorrect = userAnswer === questionData.answer;
            return (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50">
                    <Card className="text-center bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl leading-relaxed">{questionData.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {questionData.options.map((option, i) => {
                                const isSelected = userAnswer === option;
                                const isAnswerCorrect = questionData.answer === option;

                                return (
                                    <div key={i} className="relative">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className={cn(
                                                "h-auto py-3 text-lg justify-center w-full transition-all duration-300 border-2",
                                                "border-purple-400/50 bg-purple-950/50 text-purple-100 hover:bg-purple-900 hover:border-purple-300",
                                                gameState === 'revealed' && isAnswerCorrect && "border-green-400 bg-green-900/80 text-green-100",
                                                gameState === 'revealed' && isSelected && !isAnswerCorrect && "border-red-400 bg-red-950/80 text-red-100"
                                            )}
                                            onClick={() => handleAnswer(option)}
                                            disabled={gameState === 'revealed'}
                                        >
                                           {option}
                                        </Button>
                                         {gameState === 'revealed' && isAnswerCorrect && festival === 'Diwali' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Sparkles className="h-16 w-16 text-yellow-300 animate-sparkle" /></div>}
                                         {gameState === 'revealed' && isAnswerCorrect && festival === 'Holi' && <div className="absolute inset-0 bg-pink-500 rounded-lg animate-color-splash pointer-events-none"></div>}
                                    </div>
                                )
                           })}
                        </CardContent>
                    </Card>

                    {gameState === 'revealed' && (
                        <Card className="text-center animate-in fade-in-50 bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className={cn("text-3xl flex items-center justify-center gap-2", isCorrect ? "text-green-400" : "text-destructive")}>
                                    {isCorrect ? <Check /> : <X />}
                                    {isCorrect ? 'सही जवाब!' : 'गलत जवाब!'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{questionData.explanation}</p>
                                <div className="flex justify-center gap-4">
                                    <Button onClick={handleNextQuestion} size="lg">{t('nextQuestion')}</Button>
                                    <Button onClick={resetGame} size="lg" variant="outline">Choose Festival</Button>
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
                <Rocket className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('festivalQuiz')}</h1>
                <p className="text-muted-foreground">{t('festivalQuizDescription')}</p>
            </div>
            
            {renderContent()}
        </div>
    );
}
