
"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookText, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePassageWithQuestions, type PassageGeneratorOutput } from '@/ai/flows/story-weaver-flow';
import { cn } from '@/lib/utils';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const ReadingPracticePage = () => {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    
    const [passageData, setPassageData] = useState<PassageGeneratorOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setPassageData(null);
        setAnswers({});
        setAnswerStates({});
        setIsSubmitted(false);

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

    const handleSubmit = () => {
        if (!passageData) return;
        const newAnswerStates: Record<number, AnswerState> = {};
        passageData.questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                newAnswerStates[index] = 'correct';
            } else {
                newAnswerStates[index] = 'incorrect';
            }
        });
        setAnswerStates(newAnswerStates);
        setIsSubmitted(true);
    };

    return (
        <div className="space-y-6">
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
                        <CardHeader>
                            <CardTitle>Reading Passage</CardTitle>
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
                                                    isCorrect ? "border-green-500 bg-green-500/10" : "border-muted",
                                                    isWrong ? "border-destructive bg-destructive/10" : "border-muted",
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
