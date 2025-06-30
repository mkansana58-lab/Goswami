
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookText, Check, X, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePassageWithQuestions, type PassageGeneratorOutput } from '@/ai/flows/story-weaver-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { addQuizWinnings } from '@/lib/firebase';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const ReadingPracticePage = () => {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const { student, refreshStudentData } = useAuth();
    
    const [passageData, setPassageData] = useState<PassageGeneratorOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [passageAudioUrl, setPassageAudioUrl] = useState<string | null>(null);
    const [resultAudioUrl, setResultAudioUrl] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const resultAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (passageAudioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Browser prevented autoplay of passage audio."));
        }
    }, [passageAudioUrl]);

    useEffect(() => {
        if (resultAudioUrl && resultAudioRef.current) {
            resultAudioRef.current.play().catch(e => console.log("Browser prevented autoplay of result audio."));
        }
    }, [resultAudioUrl]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setPassageData(null);
        setAnswers({});
        setAnswerStates({});
        setIsSubmitted(false);
        setPassageAudioUrl(null);
        setResultAudioUrl(null);

        try {
            const res = await generatePassageWithQuestions({
                topic: "A short interesting story for a Class 6 student",
                language: language === 'hi' ? 'Hindi' : 'English',
            });
            setPassageData(res);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate a new passage.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerChange = (questionIndex: number, selectedOption: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
    };

    const handleSubmit = async () => {
        if (!passageData || !student) return;
        const newAnswerStates: Record<number, AnswerState> = {};
        let correctCount = 0;
        passageData.questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                newAnswerStates[index] = 'correct';
                correctCount++;
            } else {
                newAnswerStates[index] = 'incorrect';
            }
        });
        setAnswerStates(newAnswerStates);
        setIsSubmitted(true);

        let textToSpeak = `आपने ${passageData.questions.length} में से ${correctCount} सवालों के सही जवाब दिए हैं।`;
        
        if (correctCount === passageData.questions.length) {
            const points = 10000;
            textToSpeak += ` शानदार! आपने ${points.toLocaleString('en-IN')} अंक जीते हैं।`;
            try {
                await addQuizWinnings(student.name, points);
                await refreshStudentData(student.name);
                toast({ title: "You won 10,000 points!" });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error saving points' });
            }
        }

        try {
            const audioRes = await textToSpeech(textToSpeak);
            setResultAudioUrl(audioRes.media);
        } catch(err) {
            console.error("Failed to generate result audio", err);
        }
    };

    const handleListen = async () => {
        if (!passageData?.passage || isAudioLoading) return;
        setIsAudioLoading(true);
        setPassageAudioUrl(null);
        try {
            const response = await textToSpeech(passageData.passage);
            setPassageAudioUrl(response.media);
        } catch (error) {
            console.error("Error generating audio:", error);
            toast({ variant: "destructive", title: "Audio Error" });
        } finally {
            setIsAudioLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {passageAudioUrl && <audio ref={audioRef} src={passageAudioUrl} />}
            {resultAudioUrl && <audio ref={resultAudioRef} src={resultAudioUrl} />}
            <div className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="text-center">
                <BookText className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('readingPractice')}</h1>
                <p className="text-muted-foreground">पढ़ें, समझें, और अपनी तैयारी को परखें।</p>
            </div>

            {!passageData && !isLoading && (
                 <Card className="text-center bg-card/70 backdrop-blur-sm max-w-md mx-auto">
                    <CardHeader><CardTitle>Start a New Reading Session</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Click the button below to get a new passage and questions.</p>
                        <Button onClick={handleGenerate} size="lg">
                            Generate New Passage
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isLoading && (
                 <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            )}
            
            {passageData && (
                <div className="space-y-6">
                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reading Passage</CardTitle>
                             <Button onClick={handleListen} variant="outline" size="sm" disabled={isAudioLoading}>
                                {isAudioLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Headphones className="h-4 w-4 mr-2" />
                                )}
                                Listen
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48">
                                <p className="whitespace-pre-wrap leading-relaxed">{passageData.passage}</p>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {passageData.questions.map((q, index) => (
                             <Card key={index} className="bg-card/70 backdrop-blur-sm">
                                <CardHeader>
                                    <CardDescription>Question {index + 1}</CardDescription>
                                    <CardTitle className="text-lg">{q.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={answers[index]}
                                        onValueChange={(value) => handleAnswerChange(index, value)}
                                        disabled={isSubmitted}
                                    >
                                        {q.options.map((option, optIndex) => {
                                            const isCorrect = isSubmitted && option === q.answer;
                                            const isSelected = answers[index] === option;
                                            const isWrong = isSubmitted && isSelected && option !== q.answer;

                                            return (
                                                 <div key={optIndex} className={cn(
                                                    "flex items-center space-x-3 rounded-lg border-2 p-3 transition-colors",
                                                    isSubmitted ? "cursor-not-allowed" : "cursor-pointer",
                                                    isCorrect ? "border-green-500 bg-green-500/10" : "border-purple-500/50 hover:bg-purple-900/50",
                                                    isWrong ? "border-destructive bg-destructive/10" : "border-purple-500/50 hover:bg-purple-900/50",
                                                    !isSubmitted && isSelected ? "border-primary" : ""
                                                 )}>
                                                    <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                                                    <Label htmlFor={`q${index}-opt${optIndex}`} className="w-full text-base cursor-pointer">{option}</Label>
                                                    {isCorrect && <Check className="h-5 w-5 text-green-500" />}
                                                    {isWrong && <X className="h-5 w-5 text-destructive" />}
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                     <div className="flex justify-center gap-4">
                        {!isSubmitted ? (
                            <Button onClick={handleSubmit} size="lg">Check Answers</Button>
                        ) : (
                            <Button onClick={handleGenerate} size="lg">Generate New Passage</Button>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReadingPracticePage;
