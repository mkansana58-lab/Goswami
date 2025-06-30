
"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Truck, X, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMathQuestion, type MathQuestionOutput } from '@/ai/flows/math-tractor-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type GameState = 'start' | 'playing' | 'answered' | 'finished';
const TOTAL_LEVELS = 10;

export default function MathTractorPage() {
    const { t } = useLanguage();
    const { toast } = useToast();

    const [gameState, setGameState] = useState<GameState>('start');
    const [level, setLevel] = useState(0);
    const [question, setQuestion] = useState<MathQuestionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const fetchNewQuestion = async (currentLevel: number) => {
        setIsLoading(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
        try {
            const res = await generateMathQuestion({ level: currentLevel });
            setQuestion(res);
            setGameState('playing');
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new question. Please try again.' });
            setGameState('start');
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = () => {
        setLevel(0);
        fetchNewQuestion(0);
    };

    const handleAnswerSelect = (option: string) => {
        if (gameState !== 'playing') return;
        
        setSelectedAnswer(option);
        const correct = option === question?.answer;
        setIsCorrect(correct);
        setGameState('answered');
    };

    const handleNext = () => {
        if (isCorrect) {
            if (level + 1 >= TOTAL_LEVELS) {
                setGameState('finished');
            } else {
                const nextLevel = level + 1;
                setLevel(nextLevel);
                fetchNewQuestion(nextLevel);
            }
        } else {
            // Tractor is stuck, try again
            setSelectedAnswer(null);
            setIsCorrect(null);
            setGameState('playing');
        }
    };
    
    const tractorPosition = `calc(${level * (100 / TOTAL_LEVELS)}% - ${level > 0 ? '40px' : '0px'})`;

    const renderGameContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (gameState === 'start' || gameState === 'finished') {
            return (
                 <Card className="text-center bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                           {gameState === 'start' ? 'Get Ready to Drive!' : 'You Reached the Village!'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           {gameState === 'start' ? 'Answer math questions to drive your tractor to the village.' : 'Great job! You are a master math driver.'}
                        </p>
                        <Button onClick={startGame} size="lg">
                            {gameState === 'start' ? 'Start Driving' : 'Play Again'}
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-mono tracking-wider">{question?.question}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {question?.options.map((opt, i) => {
                        const isSelected = selectedAnswer === opt;
                        const isTheCorrectAnswer = question.answer === opt;

                        return (
                            <Button
                                key={i}
                                variant="outline"
                                size="lg"
                                className={cn(
                                    "h-auto py-4 text-2xl font-bold justify-center transition-all duration-300 border-2",
                                    gameState === 'answered' && isTheCorrectAnswer && "bg-green-500/80 border-green-400 text-black animate-pulse",
                                    gameState === 'answered' && isSelected && !isTheCorrectAnswer && "bg-red-600/80 border-red-400 text-white",
                                    gameState === 'playing' && "hover:bg-amber-500/20 hover:border-amber-400"
                                )}
                                onClick={() => handleAnswerSelect(opt)}
                                disabled={gameState !== 'playing'}
                            >
                                {opt}
                            </Button>
                        )
                    })}
                </CardContent>
                {gameState === 'answered' && (
                    <CardContent className="text-center mt-4">
                        <div className={cn("flex items-center justify-center gap-2 text-xl font-bold", isCorrect ? "text-green-400" : "text-destructive")}>
                           {isCorrect ? <Check /> : <X />}
                           {isCorrect ? 'Correct! The tractor moves on.' : 'Oops! Tractor is stuck in the mud. Try again!'}
                        </div>
                        <Button onClick={handleNext} className="mt-4">
                           {isCorrect ? 'Next Question' : 'Try This Question Again'} <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </CardContent>
                )}
            </Card>
        );
    }
    

    return (
        <div className="space-y-8">
            <div className="text-center">
                <Truck className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">Math Tractor Drive</h1>
                <p className="text-muted-foreground">Solve math problems to fuel your tractor!</p>
            </div>
            
            {/* Game Board */}
            <div className="w-full h-48 bg-green-800/20 rounded-lg p-4 relative overflow-hidden">
                {/* Road */}
                <div className="absolute bottom-10 left-0 w-full h-16 bg-stone-700/50 border-y-4 border-dashed border-stone-400/50"></div>
                
                {/* Finish Line */}
                <div className="absolute top-0 right-8 h-full w-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,#000_10px,#000_20px)]" data-ai-hint="finish line">
                    <div className="absolute inset-0 bg-gradient-to-l from-green-800/20 to-transparent"></div>
                </div>

                {/* Tractor */}
                 <div 
                    className="absolute bottom-14 transition-all duration-1000 ease-in-out" 
                    style={{ left: tractorPosition }}
                 >
                    <Image 
                        src="https://placehold.co/80x60.png" 
                        width={80} 
                        height={60} 
                        alt="Tractor" 
                        data-ai-hint="tractor cartoon"
                        className={cn(gameState === 'answered' && !isCorrect && "animate-shake")}
                    />
                 </div>
                 
                 {/* Mud Splash on wrong answer */}
                 {gameState === 'answered' && !isCorrect && (
                     <div 
                        className="absolute bottom-8 transition-all duration-1000 ease-in-out" 
                        style={{ left: tractorPosition }}
                     >
                        <Image src="https://placehold.co/80x40.png" width={80} height={40} alt="Mud Splash" data-ai-hint="mud splash" className="opacity-70"/>
                     </div>
                 )}


                {/* Progress Bar */}
                <div className="absolute top-2 left-4 right-4">
                    <p className="text-xs text-center text-white/80 mb-1">Road to Village</p>
                    <Progress value={level * (100 / TOTAL_LEVELS)} />
                </div>
            </div>

            {renderGameContent()}
            
            <style jsx>{`
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                    transform: translate3d(0, 0, 0);
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-1deg); }
                    20%, 80% { transform: translate3d(2px, 0, 0) rotate(2deg); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-3deg); }
                    40%, 60% { transform: translate3d(4px, 0, 0) rotate(3deg); }
                }
            `}</style>
        </div>
    );
}
