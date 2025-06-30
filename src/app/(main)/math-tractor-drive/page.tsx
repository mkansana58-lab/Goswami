
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck, X, Check, ArrowRight, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMathQuestion, type MathQuestionOutput } from '@/ai/flows/math-tractor-flow';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings } from '@/lib/firebase';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type GameState = 'start' | 'playing' | 'gameOver';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const TRACTOR_WIDTH = 50;
const TRACTOR_HEIGHT = 40;
const ROAD_SPEED = 2;
const FORK_Y_POSITION = 150;

export default function MathTractorPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [gameState, setGameState] = useState<GameState>('start');
    const [question, setQuestion] = useState<MathQuestionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [tractorX, setTractorX] = useState(GAME_WIDTH / 2 - TRACTOR_WIDTH / 2);
    const [roadY, setRoadY] = useState(-GAME_HEIGHT); // Start road off-screen
    const [fork, setFork] = useState<{ left: string, right: string } | null>(null);

    const gameLoopRef = useRef<NodeJS.Timeout>();
    const gameContainerRef = useRef<HTMLDivElement>(null);

    const fetchNewQuestion = useCallback(async () => {
        setIsLoading(true);
        setFork(null);
        setRoadY(-GAME_HEIGHT);
        try {
            const res = await generateMathQuestion({ level: score });
            setQuestion(res);
            
            // Randomly assign correct answer to left or right fork
            const options = [...res.options.filter(o => o !== res.answer)];
            const wrongOption = options[Math.floor(Math.random() * options.length)];
            if (Math.random() > 0.5) {
                setFork({ left: res.answer, right: wrongOption });
            } else {
                setFork({ left: wrongOption, right: res.answer });
            }
            
            setIsLoading(false);
            setRoadY(-200); // Start the road animation

        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get a question.' });
            setGameState('start');
            setIsLoading(false);
        }
    }, [score, toast]);

    const startGame = () => {
        setScore(0);
        setGameState('playing');
        fetchNewQuestion();
        gameContainerRef.current?.focus();
    };

    const gameOver = () => {
        setGameState('gameOver');
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const handleCorrectAnswer = useCallback(async () => {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore > 0 && newScore % 10 === 0) {
            const pointsWon = 10000;
            toast({ title: 'Congratulations!', description: `You won ${pointsWon.toLocaleString()} points for 10 correct answers!` });
            if(student) {
                await addQuizWinnings(student.name, pointsWon);
                await refreshStudentData(student.name);
            }
        }
        fetchNewQuestion();
    }, [score, student, toast, fetchNewQuestion, refreshStudentData]);


    const moveTractor = (direction: 'left' | 'right') => {
        if (gameState !== 'playing') return;
        const moveAmount = 20;
        if (direction === 'left') {
            setTractorX(prev => Math.max(0, prev - moveAmount));
        } else {
            setTractorX(prev => Math.min(GAME_WIDTH - TRACTOR_WIDTH, prev + moveAmount));
        }
    };
    
    // Game Loop
    useEffect(() => {
        if (gameState === 'playing' && fork) {
            gameLoopRef.current = setInterval(() => {
                setRoadY(prevY => {
                    const newY = prevY + ROAD_SPEED;
                    if (newY > GAME_HEIGHT) {
                        // If player misses the fork, it's a game over
                        gameOver();
                        return -GAME_HEIGHT;
                    }

                    // Collision detection
                    if (newY > GAME_HEIGHT - FORK_Y_POSITION && newY < GAME_HEIGHT - FORK_Y_POSITION + 50) {
                        const tractorCenter = tractorX + TRACTOR_WIDTH / 2;
                        const isLeft = tractorCenter < GAME_WIDTH / 2;
                        const chosenAnswer = isLeft ? fork.left : fork.right;

                        if (chosenAnswer === question?.answer) {
                            handleCorrectAnswer();
                        } else {
                            gameOver();
                        }
                    }
                    return newY;
                });
            }, 16); // ~60 FPS
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState, fork, tractorX, question, handleCorrectAnswer]);


     // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') moveTractor('left');
            if (e.key === 'ArrowRight') moveTractor('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);


    const renderGameScreen = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        return (
            <>
                {/* Road */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gray-600" style={{ transform: `translateY(${roadY - GAME_HEIGHT}px) translateX(-50%)` }}/>
                
                {/* Fork in the road */}
                {fork && (
                     <div className="absolute w-full" style={{ top: roadY }}>
                        <div className="absolute left-0 w-1/2 h-40 bg-gray-600 -skew-x-12" />
                        <div className="absolute right-0 w-1/2 h-40 bg-gray-600 skew-x-12" />
                        <div className="absolute top-10 w-full flex justify-around text-white font-bold text-2xl">
                           <span>{fork.left}</span>
                           <span>{fork.right}</span>
                        </div>
                    </div>
                )}
                
                {/* Tractor */}
                <div 
                    className="absolute bottom-5 transition-transform duration-100" 
                    style={{ left: tractorX, width: TRACTOR_WIDTH, height: TRACTOR_HEIGHT }}
                >
                    <Image src="https://placehold.co/100x80.png" alt="Tractor" layout="fill" data-ai-hint="red tractor top down cartoon"/>
                </div>

                {/* Question Board */}
                 {question && gameState === 'playing' && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-400 p-4 rounded-lg border-4 border-yellow-600 text-black text-center shadow-lg">
                        <p className="text-xl font-bold">{question.question}</p>
                    </div>
                 )}

                 {/* Score */}
                 <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg font-bold">
                    Score: {score}
                 </div>
            </>
        )
    }

    return (
        <div className="space-y-6 flex flex-col items-center">
            <div className="text-center">
                <Truck className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">Math Tractor Drive</h1>
                <p className="text-muted-foreground">Steer the tractor to the correct answer!</p>
            </div>
            
            <div 
                ref={gameContainerRef}
                className="w-full max-w-sm h-[500px] bg-green-500 rounded-lg overflow-hidden relative border-4 border-black"
                tabIndex={0}
            >
                {gameState === 'start' && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10">
                        <Card className="text-center">
                            <CardHeader><CardTitle>Ready to Drive?</CardTitle></CardHeader>
                            <CardContent>
                                <Button onClick={startGame} size="lg">Start Game</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
                 {gameState === 'gameOver' && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10">
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="text-destructive">Game Over!</CardTitle>
                                <CardDescription>Final Score: {score}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={startGame} size="lg">Play Again</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {gameState === 'playing' && renderGameScreen()}
            </div>
            
            {/* Mobile Controls */}
            <div className="flex md:hidden justify-between w-full max-w-sm mt-4">
                <Button onMouseDown={() => moveTractor('left')} className="p-8 text-2xl"><ArrowLeft /></Button>
                <Button onMouseDown={() => moveTractor('right')} className="p-8 text-2xl"><ArrowRight /></Button>
            </div>
        </div>
    );
}
