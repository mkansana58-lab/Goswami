
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, Target, Star, BrainCircuit, Users, Globe, Calculator, SpellCheck, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateShootingQuestion, type ShootingQuizOutput } from '@/ai/flows/shooting-quiz-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings } from '@/lib/firebase';

type GameState = 'picking_subject' | 'playing' | 'revealed';

const subjects = [
    { name: 'विज्ञान', key: 'Science', icon: Brain },
    { name: 'इतिहास', key: 'History', icon: Users },
    { name: 'भूगोल', key: 'Geography', icon: Globe },
    { name: 'सामान्य ज्ञान', key: 'General Knowledge', icon: BrainCircuit },
    { name: 'गणित', key: 'Math', icon: Calculator },
    { name: 'अंग्रेजी', key: 'English', icon: SpellCheck },
];

const balloonColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"
];

const balloonAnimationDurations = [
    "animate-float-up-1", "animate-float-up-2", "animate-float-up-3", "animate-float-up-4"
];

const ShootTheAnswerPage = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();

    const [gameState, setGameState] = useState<GameState>('picking_subject');
    const [subject, setSubject] = useState<string>('');
    const [questionData, setQuestionData] = useState<ShootingQuizOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [correctStreak, setCorrectStreak] = useState(0);
    const [lives, setLives] = useState(3);
    const [hitStatus, setHitStatus] = useState<Record<number, 'hit' | 'miss'>>({});
    
    // For mouse tracking crosshair
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const gameAreaRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const gameArea = gameAreaRef.current;
        if (gameState !== 'playing' || !gameArea) return;
        
        const updateMousePosition = (ev: MouseEvent) => {
            const rect = gameArea.getBoundingClientRect();
            setMousePosition({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
        };
        
        gameArea.addEventListener('mousemove', updateMousePosition);
        
        return () => {
            gameArea.removeEventListener('mousemove', updateMousePosition);
        };
    }, [gameState]);


    const fetchQuestion = async (selectedSubject: string) => {
        setIsLoading(true);
        setQuestionData(null);
        setHitStatus({});
        setGameState('playing');
        try {
            const res = await generateShootingQuestion({ subject: selectedSubject });
            setQuestionData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new question.' });
            setGameState('picking_subject');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSubject = (selectedSubject: string) => {
        setSubject(selectedSubject);
        setLives(3);
        setCorrectStreak(0);
        fetchQuestion(selectedSubject);
    };

    const handleShoot = async (option: string, index: number) => {
        if (gameState !== 'playing' || !questionData || !student || hitStatus[index]) return;
        
        const isCorrect = option === questionData.answer;

        if (isCorrect) {
            setHitStatus({ [index]: 'hit' });
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);

            if (newStreak > 0 && newStreak % 5 === 0) {
                const points = 5000;
                await addQuizWinnings(student.name, points);
                await refreshStudentData(student.name);
                toast({ title: `5-in-a-row! You won ${points} points!` });
            }
            
            setTimeout(() => fetchQuestion(subject), 1000); // Fetch next question after a short delay
        } else {
            setHitStatus(prev => ({ ...prev, [index]: 'miss' }));
            const newLives = lives - 1;
            setLives(newLives);
            
            if (newLives <= 0) {
                toast({ variant: 'destructive', title: "Game Over", description: "You've run out of lives!" });
                setTimeout(() => setGameState('picking_subject'), 2000);
            }
        }
    };
    
    const renderContent = () => {
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
        
        return (
            <div className="space-y-4">
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{questionData?.question}</CardTitle>
                    </CardHeader>
                </Card>
                <div ref={gameAreaRef} className="relative w-full h-[60vh] bg-blue-200 dark:bg-slate-800 rounded-lg overflow-hidden border-4 border-primary/50 cursor-none">
                     <Target style={{ left: mousePosition.x, top: mousePosition.y }} className="absolute h-8 w-8 text-red-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" />
                     <div className="absolute inset-0 bg-[url('https://placehold.co/1000x600.png')] bg-cover opacity-20" data-ai-hint="sky clouds"></div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                    ) : (
                        questionData?.options.map((option, i) => (
                           <button
                                key={i}
                                onClick={() => handleShoot(option, i)}
                                className={cn(
                                    "absolute bottom-0 w-24 h-32 flex items-center justify-center p-2 text-center text-white font-bold rounded-full transition-all duration-300",
                                    "before:content-[''] before:absolute before:bottom-[-5px] before:left-[45%] before:w-3 before:h-3 before:bg-inherit before:rotate-45 before:rounded-sm",
                                    balloonColors[i % balloonColors.length],
                                    balloonAnimationDurations[i % balloonAnimationDurations.length],
                                    hitStatus[i] === 'hit' && 'animate-pop',
                                    hitStatus[i] === 'miss' && 'animate-shake'
                                )}
                                style={{
                                    left: `${15 + i * 20}%`,
                                }}
                                disabled={!!hitStatus[i]}
                            >
                                {option}
                            </button>
                        ))
                    )}
                </div>
                 <div className="flex justify-between items-center p-2">
                    <p className="text-lg font-bold flex items-center gap-2"><Star className="text-yellow-400" /> Streak: {correctStreak}</p>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={cn("w-6 h-6 rounded-full", i < lives ? 'bg-red-500' : 'bg-muted')}></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('shootTheAnswerTitle')}</h1>
                <p className="text-muted-foreground">{t('shootTheAnswerDesc')}</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default ShootTheAnswerPage;
