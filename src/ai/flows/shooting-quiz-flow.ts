
'use server';
/**
 * @fileOverview An AI flow for generating quiz questions for the shooting game.
 * 
 * - generateShootingQuestion - A function that creates a single quiz question.
 * - ShootingQuizInput - The input type for the function.
 * - ShootingQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ShootingQuizInputSchema = z.object({
  subject: z.string().describe('The subject for the quiz question (e.g., Math, Science, History).'),
});
export type ShootingQuizInput = z.infer<typeof ShootingQuizInputSchema>;

const ShootingQuizOutputSchema = z.object({
    question: z.string().describe('The text of the question in Hindi.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers in Hindi.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
});
export type ShootingQuizOutput = z.infer<typeof ShootingQuizOutputSchema>;

export async function generateShootingQuestion(input: ShootingQuizInput): Promise<ShootingQuizOutput> {
  return shootingQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shootingQuizPrompt',
  input: { schema: ShootingQuizInputSchema },
  output: { schema: ShootingQuizOutputSchema },
  prompt: `You are a fun quiz master for an educational shooting game.
Your task is to generate one multiple-choice question in Hindi.

Instructions:
1.  The question should be from the subject: {{{subject}}}.
2.  The question and all options must be in Hindi.
3.  Generate exactly 4 options.
4.  The 'answer' field must exactly match one of the strings in the 'options' array.

Your response must be in the specified JSON format.`,
});

const shootingQuizFlow = ai.defineFlow(
  {
    name: 'shootingQuizFlow',
    inputSchema: ShootingQuizInputSchema,
    outputSchema: ShootingQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a shooting quiz question.");
    }
    return output;
  }
);
