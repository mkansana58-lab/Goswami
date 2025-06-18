
"use server";

import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/flows/generate-quiz-flow';
import { generateQuiz as generateQuizFlow } from '@/ai/flows/generate-quiz-flow';

export async function generateQuizForUser(input: GenerateQuizInput): Promise<GenerateQuizOutput | { error: string }> {
  try {
    const result = await generateQuizFlow(input);
    if (!result.questions || result.questions.length === 0 || (result.questions.length === 1 && result.questions[0].options[1] === '-')) {
        const errorMsg = input.language === 'hi' ? 'क्विज़ उत्पन्न करने में विफल। कृपया बाद में प्रयास करें।' : 'Failed to generate quiz. Please try again later.';
        return { 
            quizTitle: result.quizTitle || (input.language === 'hi' ? 'त्रुटि' : 'Error'), 
            questions: [{
                questionText: errorMsg,
                options: ['-', '-', '-', '-'],
                correctAnswerIndex: 0,
                explanation: ''
            }]
        };
    }
    return result;
  } catch (error: any) {
    console.error("Error in AI Quiz generation flow action:", error);
    const errorMessage = input.language === 'hi' ? "क्षमा करें, क्विज़ उत्पन्न करने में एक त्रुटि हुई।" : "Sorry, an error occurred while generating the quiz.";
    return { 
        error: `${errorMessage} ${error.message ? `(${error.message})` : ''}`,
        // Provide a minimal structure even on error, to prevent UI crashes if it expects questions array
        quizTitle: input.language === 'hi' ? 'त्रुटि' : 'Error',
        questions: [{
            questionText: errorMessage,
            options: ['-', '-', '-', '-'],
            correctAnswerIndex: 0,
            explanation: ''
        }]
    };
  }
}
