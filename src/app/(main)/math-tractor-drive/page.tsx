
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck, X, Check, ArrowRight, RefreshCw, Trophy, ArrowLeft, Volume2, Pause, Play, Map, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMathQuestion, type MathQuestionOutput } from '@/ai/flows/math-tractor-flow';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings, getAppConfig, type AppConfig } from '@/lib/firebase';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type GameState = 'start' | 'playing' | 'gameOver' | 'levelComplete';

const ROAD_SPEED = 2.5;
const TRACTOR_WIDTH = 70;
const TRACTOR_HEIGHT = 55;
const DISTANCE_TO_VILLAGE = 20; // 20 correct answers to win

export default function MathTractorPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [gameState, setGameState] = useState<GameState>('start');
    const [question, setQuestion] = useState<MathQuestionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(true);
    const [score, setScore] = useState(0);
    const [tractorX, setTractorX] = useState(50); // Position in %
    const [roadY, setRoadY] = useState(0);
    const [fork, setFork] = useState<{ left: string, right: string } | null>(null);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

    const gameLoopRef = useRef<number>();
    const bgAudioRef = useRef<HTMLAudioElement>(null);
    const hornAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        getAppConfig().then(setAppConfig).finally(() => setIsLoading(false));
    }, []);

    const fetchNewQuestion = useCallback(async (level: number) => {
        setIsLoading(true);
        setFork(null);
        setQuestion(null);
        setIsPaused(true);
        try {
            const res = await generateMathQuestion({ level });
            setQuestion(res);
            
            const options = [...res.options.filter(o => o !== res.answer)];
            const wrongOption = options[Math.floor(Math.random() * options.length)];
            if (Math.random() > 0.5) {
                setFork({ left: res.answer, right: wrongOption });
            } else {
                setFork({ left: wrongOption, right: res.answer });
            }
            setIsLoading(false);
            setRoadY(-100);

        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get a question.' });
            setGameState('gameOver');
            setIsLoading(false);
        }
    }, [toast]);

    const startGame = () => {
        setScore(0);
        setGameState('playing');
        fetchNewQuestion(0);
        if (bgAudioRef.current) {
            bgAudioRef.current.volume = 0.3;
            bgAudioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
        }
    };

    const gameOver = () => {
        setGameState('gameOver');
        setIsPaused(true);
    };

    const handleCorrectAnswer = useCallback(() => {
        const newScore = score + 1;
        setScore(newScore);
        setLastAnswerCorrect(true);

        if (newScore > 0 && newScore % 10 === 0) {
            const pointsWon = 10000;
            if(student) {
                addQuizWinnings(student.name, pointsWon)
                    .then(() => {
                        toast({ title: 'Congratulations!', description: `You won ${pointsWon.toLocaleString()} points for 10 correct answers!` });
                        refreshStudentData(student.name);
                    })
                    .catch(err => console.error("Error updating winnings:", err));
            }
        }
        
        if (newScore >= DISTANCE_TO_VILLAGE) {
            setGameState('levelComplete');
        } else {
            fetchNewQuestion(newScore);
        }
    }, [score, student, toast, fetchNewQuestion, refreshStudentData]);

    const moveTractor = (direction: 'left' | 'right') => {
        if (isPaused) return;
        const moveAmount = 5;
        if (direction === 'left') {
            setTractorX(prev => Math.max(25, prev - moveAmount));
        } else {
            setTractorX(prev => Math.min(75, prev + moveAmount));
        }
    };
    
    // Game Loop
    useEffect(() => {
        const gameTick = () => {
            if (isPaused || gameState !== 'playing' || !fork) {
                gameLoopRef.current = requestAnimationFrame(gameTick);
                return;
            }
            
            setRoadY(prevY => {
                const newY = prevY + ROAD_SPEED;
                
                if (newY > 75 && newY < 85) { 
                    const isLeftPath = tractorX < 50;
                    const chosenAnswer = isLeftPath ? fork.left : fork.right;

                    if (chosenAnswer === question?.answer) {
                        handleCorrectAnswer();
                    } else {
                        setLastAnswerCorrect(false);
                        gameOver();
                    }
                    return -100;
                }

                if (newY > 100) {
                    gameOver();
                    return -100;
                }
                
                return newY;
            });
            gameLoopRef.current = requestAnimationFrame(gameTick);
        }

        gameLoopRef.current = requestAnimationFrame(gameTick);

        return () => {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, isPaused, fork, tractorX, question, handleCorrectAnswer]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            if (e.key === 'ArrowLeft') moveTractor('left');
            if (e.key === 'ArrowRight') moveTractor('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, isPaused]);
    
    const playHorn = () => {
        if(hornAudioRef.current) {
            hornAudioRef.current.currentTime = 0;
            hornAudioRef.current.play();
        }
    }

    const renderGameScreen = () => (
        <div 
            className="w-full h-full bg-green-400 overflow-hidden relative cursor-none"
            style={{ 
                backgroundImage: 'url(https://placehold.co/800x1200.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
            }}
            data-ai-hint="lush green field blue sky cartoon background"
        >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150%] bg-gray-600 " style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)', perspective: '300px', transform: 'rotateX(45deg) translateY(-25%)'}}>
                 <div className="absolute top-0 left-0 w-full h-full bg-repeat-y" style={{ backgroundImage: 'url(https://placehold.co/20x40.png)', animation: isPaused ? 'none' : 'roadAnimation 1s linear infinite' }} data-ai-hint="road dashed line"/>
            </div>

            {fork && (
                <div className="absolute w-[200%] left-[-50%]" style={{ top: `${roadY}%`, transition: 'top 0.05s linear' }}>
                    <div className="absolute left-[25%] -translate-x-1/2 w-1/2 h-64 bg-gray-700 -skew-x-12" style={{backgroundImage: 'url(https://placehold.co/400x200.png)'}} data-ai-hint="asphalt road texture"/>
                    <div className="absolute right-[25%] translate-x-1/2 w-1/2 h-64 bg-gray-700 skew-x-12" style={{backgroundImage: 'url(https://placehold.co/400x200.png)'}} data-ai-hint="asphalt road texture"/>
                    <div className="absolute top-20 w-full flex justify-around text-white font-bold text-3xl drop-shadow-2xl">
                        <div className="w-1/3 text-center bg-black/50 p-2 rounded-md">{fork.left}</div>
                        <div className="w-1/3 text-center bg-black/50 p-2 rounded-md">{fork.right}</div>
                    </div>
                </div>
            )}
            
            <div 
                className={cn("absolute bottom-5 transition-all duration-100 ease-linear", lastAnswerCorrect === false && gameState === 'gameOver' && "animate-shake")} 
                style={{ 
                    left: `${tractorX}%`, 
                    width: TRACTOR_WIDTH, 
                    height: TRACTOR_HEIGHT, 
                    transform: 'translateX(-50%)',
                    filter: `hue-rotate(${score * 18}deg)`,
                }}
            >
                <Image src={appConfig?.tractorImageUrl || "https://placehold.co/100x80.png"} alt="Tractor" layout="fill" data-ai-hint="red tractor top down cartoon 3d render"/>
            </div>
            
            {score >= DISTANCE_TO_VILLAGE && (
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-48 h-32">
                     <Image src="https://placehold.co/400x300.png" alt="Village" layout="fill" data-ai-hint="small village cartoon top down view"/>
                </div>
            )}

            {question && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[80%] max-w-sm p-4 rounded-lg text-black text-center shadow-lg" style={{backgroundImage: 'url(https://placehold.co/400x150.png)'}} data-ai-hint="wooden sign board">
                    <p className="text-xl font-bold text-white drop-shadow-md">{question.question}</p>
                </div>
             )}
        </div>
    );

    const renderUI = () => (
        <div className="absolute inset-0 z-10 p-2 md:p-4 pointer-events-none">
            <div className="flex justify-between items-start">
                 <div className="bg-black/50 text-white p-2 rounded-lg pointer-events-auto">
                    <h2 className="text-sm font-bold">SCORE: {score}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Map className="h-4 w-4"/>
                        <Progress value={(score / DISTANCE_TO_VILLAGE) * 100} className="w-24 md:w-32" />
                        <Truck className="h-4 w-4 text-yellow-400" />
                    </div>
                 </div>
                 <Button size="icon" variant="destructive" className="pointer-events-auto" onClick={() => setGameState('start')}>
                    <Power/>
                 </Button>
            </div>

             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                 <Button size="icon" className="w-16 h-16 rounded-full pointer-events-auto bg-gray-800/80" onMouseDown={() => moveTractor('left')} onTouchStart={() => moveTractor('left')}><ArrowLeft className="w-8 h-8"/></Button>
                 
                 <div className="flex items-center gap-2 pointer-events-auto">
                     <Button variant="secondary" size="icon" className="w-14 h-14 rounded-full" onClick={playHorn}><Volume2 className="w-7 h-7"/></Button>
                     <Button variant={isPaused ? "secondary" : "default"} onClick={() => setIsPaused(!isPaused)} disabled={isLoading} className="w-28 h-14">
                        {isLoading ? <Loader2 className="animate-spin" /> : isPaused ? <><Play className="mr-2"/>Drive</> : <><Pause className="mr-2"/>Brake</>}
                     </Button>
                 </div>
                 
                 <Button size="icon" className="w-16 h-16 rounded-full pointer-events-auto bg-gray-800/80" onMouseDown={() => moveTractor('right')} onTouchStart={() => moveTractor('right')}><ArrowRight className="w-8 h-8"/></Button>
             </div>
        </div>
    );

    const renderPopupOverlay = () => {
        if (gameState === 'gameOver') {
             return (
                 <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-destructive">Game Over!</CardTitle>
                            <CardDescription>Final Score: {score}</CardDescription>
                        </CardHeader>
                        <CardContent><Button onClick={startGame} size="lg">Play Again</Button></CardContent>
                    </Card>
                </div>
            )
        }
        if (gameState === 'levelComplete') {
            return (
                 <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-green-400 flex items-center gap-2"><Trophy/> Village Reached!</CardTitle>
                            <CardDescription>Congratulations! Final Score: {score}</CardDescription>
                        </CardHeader>
                        <CardContent><Button onClick={startGame} size="lg">Play Again</Button></CardContent>
                    </Card>
                </div>
            )
        }
        return null;
    }
    
    const renderStartScreen = () => {
        const handleComingSoon = () => {
            toast({ title: "Coming Soon!", description: "This feature will be available in a future update." });
        };
    
        return (
            <div className="w-full h-full relative overflow-hidden bg-[#a5d8f0]">
                <Image src="https://placehold.co/800x1200.png" layout="fill" objectFit="cover" alt="Farm background" data-ai-hint="cartoon farm landscape green field" />
    
                <div className="absolute inset-0 z-10 p-4 flex flex-col items-center justify-between">
                    {/* Top bar */}
                    <div className="w-full flex justify-between items-start">
                        <button onClick={handleComingSoon} className="relative w-20 h-20 bg-contain bg-no-repeat bg-center" style={{backgroundImage: "url('https://placehold.co/100x100.png')"}} data-ai-hint="purple settings gear button icon">
                            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-white font-bold text-[10px] tracking-wider drop-shadow-md">SETTINGS</span>
                        </button>
                        
                        <div className="relative w-56 sm:w-64 h-32 -mt-2 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/400x200.png')"}} data-ai-hint="wooden sign board">
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-4xl sm:text-5xl font-bold text-[#5C4033] font-headline -space-y-2 sm:-space-y-3">
                                 <p>MATH</p>
                                 <p>TRACTOR</p>
                                 <p>DRIVE</p>
                             </div>
                        </div>
                        
                        <button onClick={handleComingSoon} className="relative w-20 h-20 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/100x100.png')"}} data-ai-hint="yellow score bottle cap icon">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-black font-bold text-sm">
                                <span>मेरा</span>
                                <span>स्कोर</span>
                            </div>
                        </button>
                    </div>
    
                    {/* Tractor */}
                    <div className="relative w-60 h-48 sm:w-72 sm:h-56 -mt-16">
                        <Image src={appConfig?.tractorImageUrl || "https://placehold.co/400x300.png"} layout="fill" objectFit="contain" alt="Red tractor" data-ai-hint="red tractor cartoon side view" />
                    </div>
    
                    {/* Main Buttons */}
                    <div className="flex items-end justify-center w-full gap-1 sm:gap-2 -mt-12">
                         <button onClick={handleComingSoon} className="relative w-28 h-28 sm:w-32 sm:h-32 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/150x150.png')"}} data-ai-hint="blue tire button icon">
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xl sm:text-2xl font-bold font-headline drop-shadow-lg">लेवल्स</span>
                         </button>
                         
                         <button onClick={startGame} className="relative w-32 h-32 sm:w-40 sm:h-40 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/200x200.png')"}} data-ai-hint="green tire button icon">
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-2xl sm:text-3xl font-bold font-headline drop-shadow-lg">
                                <span>गेम</span>
                                <span className="-mt-2">शुरू करें</span>
                             </div>
                         </button>
                         
                         <button onClick={handleComingSoon} className="relative w-28 h-28 sm:w-32 sm:h-32 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/150x150.png')"}} data-ai-hint="purple gear button icon">
                             <span className="absolute inset-0 flex items-center justify-center text-white text-xl sm:text-2xl font-bold font-headline drop-shadow-lg">Settings</span>
                         </button>
                    </div>
    
                    {/* Bottom Info Cards */}
                    <div className="w-full max-w-md grid grid-cols-3 gap-2 sm:gap-4">
                         <div className="bg-[#f8e8c1] p-2 rounded-lg border-2 border-[#d2b48c] text-center text-[#8B4513] shadow-md">
                            <p className="text-[10px] sm:text-xs font-semibold">⭐ आज का लक्ष्य</p>
                            <p className="font-bold text-xs sm:text-sm">10 सही जोड़</p>
                         </div>
                         <div className="bg-[#f8e8c1] p-2 rounded-lg border-2 border-[#d2b48c] text-center text-[#8B4513] shadow-md">
                             <p className="text-[10px] sm:text-xs font-semibold">🧠 आज का ब्रेन क्विज़</p>
                             <p className="font-bold text-xs sm:text-sm">1 बोनस सवाल</p>
                         </div>
                         <div className="bg-[#f8e8c1] p-2 rounded-lg border-2 border-[#d2b48c] text-center text-[#8B4513] shadow-md">
                             <p className="text-[10px] sm:text-xs font-semibold">आपके Coins</p>
                             <p className="font-bold text-xs sm:text-sm">🪙 {(student?.quizWinnings || 0).toLocaleString()}</p>
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-[calc(100vh-8rem)] bg-black flex items-center justify-center">
            <style>{`
                @keyframes roadAnimation {
                    from { background-position-y: 0; }
                    to { background-position-y: -80px; }
                }
            `}</style>
            <audio ref={bgAudioRef} src="https://placehold.co/audio/village_flute_ambient.mp3" loop data-ai-hint="village flute ambient"/>
            <audio ref={hornAudioRef} src="https://placehold.co/audio/truck_horn.mp3" data-ai-hint="truck horn"/>

            <div className="w-full max-w-md h-full relative" >
                {isLoading ? (
                    <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : gameState === 'start' ? (
                    renderStartScreen()
                ) : (
                    <>
                        {renderGameScreen()}
                        {gameState === 'playing' && renderUI()}
                        {renderPopupOverlay()} 
                    </>
                )}
            </div>
        </div>
    );
}

