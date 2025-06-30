
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, X, Banknote, BookOpen, Globe, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateBazaarQuestion, type BazaarQuizOutput } from '@/ai/flows/knowledge-bazaar-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings, getAppConfig } from '@/lib/firebase';

type GameState = 'picking_category' | 'playing' | 'revealed';

const categories = [
  { name: 'फसलें', key: 'Indian Crops', icon: BookOpen },
  { name: 'राज्य/राजधानी', key: 'States & Capitals', icon: Globe },
  { name: 'राष्ट्रीय प्रतीक', key: 'National Symbols', icon: Landmark },
];

export default function KnowledgeBazaarPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [gameState, setGameState] = useState<GameState>('picking_category');
    const [category, setCategory] = useState<string | null>(null);
    const [questionData, setQuestionData] = useState<BazaarQuizOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [backgroundUrl, setBackgroundUrl] = useState('');

    useEffect(() => {
        getAppConfig().then(config => {
            if (config.knowledgeBazaarBgUrl) {
                setBackgroundUrl(config.knowledgeBazaarBgUrl);
            }
        });
    }, []);


    const fetchQuestion = async (selectedCategory: string) => {
        setIsLoading(true);
        setQuestionData(null);
        setUserAnswer(null);
        setGameState('playing');
        try {
            const res = await generateBazaarQuestion({ category: selectedCategory });
            setQuestionData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new question.' });
            setGameState('picking_category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
        fetchQuestion(selectedCategory);
    };

    const handleAnswer = async (answer: string) => {
        if (gameState !== 'playing' || !questionData || !student) return;
        setUserAnswer(answer);
        setGameState('revealed');
        
        const isCorrect = answer === questionData.answer;
        if (isCorrect) {
            const points = 100;
            await addQuizWinnings(student.name, points);
            await refreshStudentData(student.name);
            toast({ title: `Correct! You won ${points} points!` });
        }
    };

    const handleNextQuestion = () => {
        if (!category) return;
        fetchQuestion(category);
    };
    
    const resetGame = () => {
        setGameState('picking_category');
        setCategory(null);
        setQuestionData(null);
        setUserAnswer(null);
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (gameState === 'picking_category') {
            return (
                <Card className="text-center bg-card/70 backdrop-blur-sm max-w-md mx-auto animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>एक दुकान चुनें</CardTitle>
                        <CardDescription>Select a shop to start the quiz</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        {categories.map(c => (
                            <Button key={c.key} onClick={() => handleSelectCategory(c.key)} size="lg" className="h-20 text-lg">
                                <c.icon className="h-8 w-8 mr-4" /> {c.name}
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
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="lg"
                                        className={cn(
                                            "h-auto py-3 text-lg justify-center w-full transition-all duration-300 border-2",
                                            "border-green-400/50 bg-green-950/50 text-green-100 hover:bg-green-900 hover:border-green-300",
                                            gameState === 'revealed' && isAnswerCorrect && "border-amber-400 bg-amber-900/80 text-amber-100",
                                            gameState === 'revealed' && isSelected && !isAnswerCorrect && "border-red-400 bg-red-950/80 text-red-100"
                                        )}
                                        onClick={() => handleAnswer(option)}
                                        disabled={gameState === 'revealed'}
                                    >
                                       {option}
                                    </Button>
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
                                    <Button onClick={resetGame} size="lg" variant="outline">Choose Category</Button>
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
        <div className="space-y-6 relative h-full">
            <div 
                className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-slate-950 bg-cover bg-center"
                style={{ backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)" }}
            >
                 <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="text-center">
                <Banknote className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('villageMarket')}</h1>
                <p className="text-muted-foreground">{t('villageMarketDescription')}</p>
            </div>
            
            {renderContent()}
        </div>
    );
}
