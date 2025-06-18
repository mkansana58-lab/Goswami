
"use server";

import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/flows/generate-quiz-flow';
import { generateQuiz as generateQuizFlow } from '@/ai/flows/generate-quiz-flow';

export async function generateQuizForUser(input: GenerateQuizInput): Promise<GenerateQuizOutput | { error: string }> {
  try {
    const result = await generateQuizFlow(input);
    // The flow now robustly handles its own "generation failed" cases by returning a specific structure.
    // We can directly return the result. The UI will check for the specific error structure
    // (e.g., questionText indicating an error and options like ['Try Again', '-', '-', '-'])
    // or if an 'error' property is present for true system errors.
    return result;
  } catch (error: any) {
    console.error("Error in AI Quiz generation flow action:", error);
    const errorMessage = input.language === 'hi' ? "क्षमा करें, क्विज़ उत्पन्न करने में एक त्रुटि हुई।" : "Sorry, an error occurred while generating the quiz.";
    // This is for true system errors or unexpected Genkit errors
    return { 
        error: `${errorMessage} ${error.message ? `(${error.message})` : ''}`
    };
  }
}

    