
'use server';
/**
 * @fileOverview An AI flow for generating math problems for a tractor game.
 * 
 * - generateMathQuestion - Creates a single math question.
 * - MathQuestionInput - The input type for the function.
 * - MathQuestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MathQuestionInputSchema = z.object({
  level: z.number().min(0).describe('The current level of the game, used to determine difficulty.'),
});
export type MathQuestionInput = z.infer<typeof MathQuestionInputSchema>;

const MathQuestionOutputSchema = z.object({
    question: z.string().describe('The math problem, written as a simple string (e.g., "15 + 7 = ?").'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible numeric answers as strings.'),
    answer: z.string().describe('The correct numeric answer, which must be one of the strings from the options array.'),
});
export type MathQuestionOutput = z.infer<typeof MathQuestionOutputSchema>;

export async function generateMathQuestion(input: MathQuestionInput): Promise<MathQuestionOutput> {
  return mathQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mathQuestionPrompt',
  input: { schema: MathQuestionInputSchema },
  output: { schema: MathQuestionOutputSchema },
  prompt: `You are a math teacher creating questions for a fun tractor racing game for kids (Class 1-5).
The difficulty should increase with the level.

Level: {{{level}}}

Instructions:
1.  Based on the level, create an appropriate math problem.
    - Level 0-3: Simple addition/subtraction (e.g., 5 + 8, 15 - 6).
    - Level 4-7: Slightly harder addition/subtraction, or simple multiplication (e.g., 25 + 17, 8 * 4).
    - Level 8-10: Multiplication or simple division (e.g., 12 * 6, 36 / 4).
    - Level >10: Mixed operations.
2.  The 'question' should be a string like "12 + 5 = ?".
3.  The 'answer' must be the correct numeric result as a string.
4.  Generate 3 incorrect but plausible options (distractors).
5.  The 'options' array must contain the correct answer and 3 distractors, shuffled.
6.  All options and the answer must be strings.

Your response must be in the specified JSON format.`,
});

const mathQuestionFlow = ai.defineFlow(
  {
    name: 'mathQuestionFlow',
    inputSchema: MathQuestionInputSchema,
    outputSchema: MathQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a math question.");
    }
    return output;
  }
);
