
"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Truck, X, Check, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMathQuestion, type MathQuestionOutput } from '@/ai/flows/math-tractor-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type GameState = 'start' | 'playing' | 'answered' | 'finished';
const TOTAL_LEVELS = 20; // Increased levels for more difficulty

export default function MathTractorPage() {
    const { t } = useLanguage();
    const { toast } = useToast();

    const [gameState, setGameState] = useState<GameState>('start');
    const [level, setLevel] = useState(0);
    const [question, setQuestion] = useState<MathQuestionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [tractorColor, setTractorColor] = useState('red');

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
        setTractorColor('red');
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
                // Change tractor color at certain levels
                if (nextLevel === 5) setTractorColor('blue');
                if (nextLevel === 12) setTractorColor('green');
                fetchNewQuestion(nextLevel);
            }
        } else {
            // Tractor is stuck, try again
            setSelectedAnswer(null);
            setIsCorrect(null);
            setGameState('playing');
        }
    };
    
    // Calculate tractor position as a percentage.
    const tractorPosition = level * (100 / TOTAL_LEVELS);

    const renderGameContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (gameState === 'start' || gameState === 'finished') {
            return (
                 <Card className="text-center bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center justify-center gap-3">
                           {gameState === 'start' ? 'Get Ready to Drive!' : <><Trophy className="text-amber-400 h-8 w-8"/>You Reached the Village!</>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           {gameState === 'start' ? 'सही जवाब देकर अपने ट्रैक्टर को गाँव तक पहुँचाएँ।' : 'बहुत बढ़िया! आप एक माहिर मैथ ड्राइवर हैं।'}
                        </p>
                        <Button onClick={startGame} size="lg">
                            {gameState === 'start' ? 'Start Driving' : 'Play Again'} <RefreshCw className="ml-2 h-4 w-4"/>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-center text-xl md:text-3xl font-sans tracking-wide">{question?.question}</CardTitle>
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
                                    "h-auto py-4 text-xl font-bold justify-center transition-all duration-300 border-2",
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
                           {isCorrect ? 'सही जवाब! ट्रैक्टर आगे बढ़ गया।' : 'गलत जवाब! ट्रैक्टर कीचड़ में फँस गया।'}
                        </div>
                        <Button onClick={handleNext} className="mt-4">
                           {isCorrect ? 'अगला सवाल' : 'फिर से कोशिश करें'} <ArrowRight className="ml-2 h-4 w-4"/>
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
                <p className="text-muted-foreground">गणित के सवाल हल करें और अपने ट्रैक्टर को आगे बढ़ाएँ!</p>
            </div>
            
            {/* Game Board */}
            <div className="w-full h-56 bg-gradient-to-b from-cyan-400 to-sky-600 rounded-lg p-4 relative overflow-hidden shadow-inner">
                {/* Background Scenery */}
                 <div className="absolute bottom-16 left-0 w-full h-20 bg-green-600"></div>
                 <div className="absolute bottom-16 left-0 w-[2000px] h-20 bg-[url('https://www.transparenttextures.com/patterns/farmer.png')] opacity-10"></div>
                 <Image src="https://placehold.co/100x50.png" alt="Tree" width={100} height={50} className="absolute bottom-20 left-[15%]" data-ai-hint="cartoon tree"/>
                 <Image src="https://placehold.co/80x40.png" alt="Tree" width={80} height={40} className="absolute bottom-20 left-[45%]" data-ai-hint="cartoon tree"/>
                 <Image src="https://placehold.co/120x60.png" alt="Tree" width={120} height={60} className="absolute bottom-20 left-[70%]" data-ai-hint="cartoon tree"/>

                {/* Winding Road SVG */}
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-24">
                    <path d="M-50,60 C200,10 300,100 500,60 S700,0 1050,50" stroke="#a16207" strokeWidth="35" fill="none" />
                    <path d="M-50,60 C200,10 300,100 500,60 S700,0 1050,50" stroke="#ca8a04" strokeWidth="25" fill="none" />
                     <path d="M-50,60 C200,10 300,100 500,60 S700,0 1050,50" stroke="#eab308" strokeDasharray="15 15" strokeWidth="2" fill="none" />
                </svg>

                {/* Village at the end */}
                <Image src="https://placehold.co/150x75.png" alt="Village" width={150} height={75} className="absolute bottom-16 right-0" data-ai-hint="small village cartoon"/>

                {/* Tractor */}
                 <div 
                    className="absolute bottom-[4.5rem] transition-all duration-1000 ease-in-out" 
                    style={{ left: `calc(${tractorPosition}% - 40px)` }}
                 >
                    <Image 
                        src="https://placehold.co/80x60.png" 
                        width={80} 
                        height={60} 
                        alt="Tractor" 
                        data-ai-hint={`${tractorColor} tractor side view cartoon`}
                        className={cn("drop-shadow-lg", gameState === 'answered' && !isCorrect && "animate-shake")}
                    />
                 </div>
                 
                 {/* Mud Splash on wrong answer */}
                 {gameState === 'answered' && !isCorrect && (
                     <div 
                        className="absolute bottom-10 transition-all duration-1000 ease-in-out" 
                        style={{ left: `calc(${tractorPosition}% - 20px)` }}
                     >
                        <Image src="https://placehold.co/80x40.png" width={80} height={40} alt="Mud Splash" data-ai-hint="mud splash cartoon" className="opacity-70"/>
                     </div>
                 )}


                {/* Progress Bar */}
                <div className="absolute top-2 left-4 right-4">
                    <p className="text-xs text-center text-white/80 mb-1">Road to Village</p>
                    <Progress value={tractorPosition} />
                </div>
            </div>

            {renderGameContent()}
            
            <style jsx>{\`
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
            \`}</style>
        </div>
    );
}
