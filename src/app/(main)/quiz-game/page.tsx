
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BrainCircuit, Users, Brain, Gamepad2, IndianRupee, X, Check, ArrowRight, Globe, Dribbble, Calculator, SpellCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuizQuestion, type QuizGameOutput } from '@/ai/flows/quiz-game-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings } from '@/lib/firebase';

type GameState = 'picking_subject' | 'playing' | 'answer_revealed' | 'game_over';
type Lifeline = 'fiftyFifty';

const prizeLadder = [
  { amount: 1000, safe: false }, { amount: 2000, safe: false }, { amount: 3000, safe: false }, { amount: 5000, safe: false }, { amount: 10000, safe: true },
  { amount: 20000, safe: false }, { amount: 40000, safe: false }, { amount: 80000, safe: false }, { amount: 160000, safe: false }, { amount: 320000, safe: true },
  { amount: 640000, safe: false }, { amount: 1250000, safe: false }, { amount: 2500000, safe: false }, { amount: 5000000, safe: false }, { amount: 10000000, safe: true },
];

const subjects = [
  { name: 'सामान्य ज्ञान', icon: BrainCircuit },
  { name: 'विज्ञान', icon: Brain },
  { name: 'गणित', icon: Calculator },
  { name: 'अंग्रेजी', icon: SpellCheck },
  { name: 'इतिहास', icon: Users },
  { name: 'भूगोल', icon: Globe },
  { name: 'खेल', icon: Dribbble },
];

const QuizGamePage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { student, refreshStudentData } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('picking_subject');
  const [subject, setSubject] = useState<string>('');
  const [level, setLevel] = useState(0);
  const [question, setQuestion] = useState<QuizGameOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [lifelines, setLifelines] = useState<Record<Lifeline, boolean>>({ fiftyFifty: true });
  const [winningsAdded, setWinningsAdded] = useState(false);
  const [introAudioUrl, setIntroAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const generateIntro = async () => {
        try {
            const response = await textToSpeech("कौन बनेगा करोड़पति में आपका स्वागत है!");
            setIntroAudioUrl(response.media);
        } catch (error) {
            console.error("Failed to generate intro audio:", error);
        }
    };
    generateIntro();
  }, []);

  useEffect(() => {
    if (introAudioUrl && audioRef.current) {
        audioRef.current.play().catch(e => console.log("Browser prevented autoplay of intro audio."));
    }
  }, [introAudioUrl]);

  const getSafePrize = () => {
    let safeAmount = 0;
    for (let i = level - 1; i >= 0; i--) {
        if (prizeLadder[i].safe) {
            safeAmount = prizeLadder[i].amount;
            break;
        }
    }
    return safeAmount;
  };
  
  useEffect(() => {
    if (gameState === 'game_over' && !winningsAdded && student?.name) {
        const isCorrect = selectedAnswer === question?.answer;
        const amountWon = isCorrect ? prizeLadder[level].amount : getSafePrize();
        if (amountWon > 0) {
            addQuizWinnings(student.name, amountWon)
                .then(() => {
                    refreshStudentData(student.name);
                    toast({ title: `Congratulations!`, description: `₹${amountWon.toLocaleString('en-IN')} added to your winnings!` });
                    setWinningsAdded(true); // Set only on successful save
                })
                .catch(() => {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your winnings.' });
                });
        } else {
             // No winnings, but mark as "processed" to prevent re-triggering
            setWinningsAdded(true);
        }
    }
  }, [gameState, question, selectedAnswer, level, student, refreshStudentData, toast, winningsAdded]);


  const resetGame = () => {
    setGameState('picking_subject');
    setSubject('');
    setLevel(0);
    setQuestion(null);
    setSelectedAnswer(null);
    setHiddenOptions([]);
    setLifelines({ fiftyFifty: true });
    setWinningsAdded(false);
  };
  
  const fetchQuestion = async (currentLevel: number, selectedSubject: string) => {
    setIsLoading(true);
    try {
      const res = await generateQuizQuestion({
        subject: selectedSubject,
        difficulty: `for ₹${prizeLadder[currentLevel].amount.toLocaleString('en-IN')}`,
      });
      setQuestion(res);
      setHiddenOptions([]);
      setSelectedAnswer(null);
      setGameState('playing');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error generating question' });
      setGameState('game_over');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubject = (selectedSubject: string) => {
    setSubject(selectedSubject);
    fetchQuestion(0, selectedSubject);
  };

  const handleAnswerSelect = (option: string) => {
    if (gameState !== 'playing') return;
    setSelectedAnswer(option);
    setIsLoading(true);
    setTimeout(() => {
        setGameState('answer_revealed');
        setIsLoading(false);
    }, 2000); // Dramatic pause
  };
  
  const handleNextStep = () => {
    if (selectedAnswer === question?.answer) {
        if (level === prizeLadder.length - 1) {
            setGameState('game_over'); // Won the grand prize!
        } else {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            fetchQuestion(nextLevel, subject);
        }
    } else {
        setGameState('game_over');
    }
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || !question || gameState !== 'playing') return;
    
    const incorrectOptions = question.options.filter(opt => opt !== question.answer);
    const optionsToHide = [];
    while(optionsToHide.length < 2) {
        const randomIdx = Math.floor(Math.random() * incorrectOptions.length);
        const option = incorrectOptions.splice(randomIdx, 1)[0];
        if(option) optionsToHide.push(option);
    }
    setHiddenOptions(optionsToHide);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };
  
  const renderContent = () => {
    switch(gameState) {
      case 'picking_subject':
        return (
          <Card className="text-center animate-in fade-in-50 bg-card/70 backdrop-blur-sm">
            <CardHeader><CardTitle>Choose Your Subject</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {subjects.map(s => (
                <Button key={s.name} onClick={() => handleSelectSubject(s.name)} size="lg" className="w-full">
                  <s.icon className="mr-2 h-5 w-5" /> {s.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        );

      case 'game_over':
        const isCorrectFinal = selectedAnswer === question?.answer;
        const amountWon = isCorrectFinal ? prizeLadder[level].amount : getSafePrize();
        return (
             <Card className="text-center animate-in fade-in-50 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className={cn("text-3xl", amountWon > 0 ? "text-green-400" : "text-destructive")}>
                        {amountWon > 0 ? `Congratulations!` : 'Game Over'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">You have won:</p>
                    <p className="text-5xl font-bold flex items-center justify-center text-amber-400">
                        <IndianRupee className="h-10 w-10"/>
                        {amountWon.toLocaleString('en-IN')}
                    </p>
                    <Button onClick={resetGame} size="lg" className="mt-4">Play Again</Button>
                </CardContent>
            </Card>
        );

      default: // playing or answer_revealed
        if (isLoading && !question) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }
        if (!question) return null;

        const isCorrect = selectedAnswer === question.answer;

        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col-reverse lg:flex-row gap-8">
                {/* Main Game Area */}
                <div className="flex-1 space-y-6">
                    {/* Lifelines */}
                     <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            className="relative rounded-full aspect-square h-16 w-16 flex flex-col border-2 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-yellow-500/10 disabled:shadow-none disabled:opacity-50"
                            onClick={useFiftyFifty}
                            disabled={!lifelines.fiftyFifty || gameState !== 'playing'}
                        >
                           <span className="font-bold text-lg">50:50</span>
                           {!lifelines.fiftyFifty && <X className="h-8 w-8 absolute text-destructive/70"/>}
                        </Button>
                    </div>

                    {/* Question Card */}
                    <Card className="text-center relative overflow-hidden bg-black/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl leading-relaxed text-white font-sans">
                                {question.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((opt, i) => {
                                const isHidden = hiddenOptions.includes(opt);
                                const isSelected = selectedAnswer === opt;
                                const isAnswer = gameState === 'answer_revealed' && question.answer === opt;
                                const isWrongSelection = gameState === 'answer_revealed' && isSelected && !isCorrect;
                                
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="lg"
                                        className={cn(
                                            "h-auto py-3 text-base md:text-lg justify-start transition-all duration-300 border-2 border-blue-400/50 bg-blue-950/50 text-blue-100 hover:bg-blue-900 hover:border-blue-300",
                                            isHidden && "opacity-0 pointer-events-none",
                                            isSelected && "bg-yellow-500/80 border-yellow-400 text-black shadow-[0_0_10px_#facc15]",
                                            isAnswer && "bg-green-500/80 border-green-400 text-black animate-pulse shadow-[0_0_15px_#22c55e]",
                                            isWrongSelection && "bg-red-600/80 border-red-400 text-white shadow-[0_0_15px_#ef4444]"
                                        )}
                                        onClick={() => handleAnswerSelect(opt)}
                                        disabled={gameState !== 'playing'}
                                    >
                                        <span className="font-bold mr-4 text-yellow-400">{String.fromCharCode(65 + i)}:</span>
                                        {opt}
                                    </Button>
                                )
                            })}
                        </CardContent>
                         {isLoading && gameState === 'playing' && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                                <Loader2 className="h-10 w-10 animate-spin text-white" />
                            </div>
                        )}
                    </Card>

                    {/* Explanation / Next Button */}
                    {gameState === 'answer_revealed' && (
                         <Card className="animate-in fade-in-50 text-center bg-black/30 border-muted-foreground/30">
                            <CardHeader>
                                <CardTitle className={cn("flex items-center justify-center gap-2 text-2xl", isCorrect ? "text-green-400" : "text-destructive")}>
                                    {isCorrect ? <Check /> : <X />}
                                    {isCorrect ? 'Correct Answer!' : 'Wrong Answer!'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300">{question.explanation}</p>
                                <Button onClick={handleNextStep} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                                    {isCorrect ? 'Next Question' : 'See Final Score'} <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            </CardContent>
                         </Card>
                    )}
                </div>

                {/* Prize Ladder */}
                <div className="w-full lg:w-64 shrink-0">
                    <ul className="flex flex-row-reverse lg:flex-col-reverse justify-center gap-1">
                        {prizeLadder.map((prize, i) => (
                            <li key={prize.amount} className={cn(
                                "text-center rounded-md p-1 lg:p-2 text-sm lg:text-base transition-all duration-300 font-bold text-slate-300/70 border border-transparent",
                                i < level && "text-yellow-600/70",
                                i === level && "bg-orange-500/80 text-white scale-110 border-orange-300 shadow-lg shadow-orange-500/30",
                                prize.safe && "text-cyan-300"
                            )}>
                                <span className="hidden lg:inline-block mr-2 opacity-70">{prizeLadder.length - i}.</span>
                                <IndianRupee className="inline h-3 w-3 lg:h-4 lg:w-4 mb-0.5" />
                                {prize.amount.toLocaleString('en-IN')}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
  }


  return (
    <div className="space-y-6 relative">
      {introAudioUrl && <audio ref={audioRef} src={introAudioUrl} />}
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
       <div className="flex flex-col items-center text-center">
            <Gamepad2 className="h-16 w-16 text-primary animate-pulse" />
            <h1 className="text-4xl font-headline font-bold mt-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">कौन बनेगा करोड़पति</h1>
            <p className="text-muted-foreground">खेलें, सीखें, और जीतें!</p>
        </div>
        {renderContent()}
    </div>
  );
};

export default QuizGamePage;
