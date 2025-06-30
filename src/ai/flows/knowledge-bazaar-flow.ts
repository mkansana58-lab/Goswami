
'use server';
/**
 * @fileOverview An AI flow for generating general knowledge questions for the bazaar game.
 * 
 * - generateBazaarQuestion - Creates a single quiz question.
 * - BazaarQuizInput - The input type for the function.
 * - BazaarQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BazaarQuizInputSchema = z.object({
  category: z.string().describe('The category for the GK question (e.g., "National Symbols", "Indian Crops", "States & Capitals").'),
});
export type BazaarQuizInput = z.infer<typeof BazaarQuizInputSchema>;

const BazaarQuizOutputSchema = z.object({
    question: z.string().describe('The text of the question in Hindi.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers in Hindi.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
    explanation: z.string().describe('A brief, simple explanation of the correct answer in Hindi.'),
});
export type BazaarQuizOutput = z.infer<typeof BazaarQuizOutputSchema>;

export async function generateBazaarQuestion(input: BazaarQuizInput): Promise<BazaarQuizOutput> {
  return bazaarQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bazaarQuizPrompt',
  input: { schema: BazaarQuizInputSchema },
  output: { schema: BazaarQuizOutputSchema },
  prompt: `You are a quiz master for a game called "गांव का ज्ञान बाजार" (Village Knowledge Market).
Your task is to generate one multiple-choice general knowledge question in Hindi based on the chosen shop category.

Category: {{{category}}}

Instructions:
1.  The question and all options must be in Hindi.
2.  Generate exactly 4 options.
3.  The 'answer' field must exactly match one of the strings in the 'options' array.
4.  The 'explanation' field should provide a simple, interesting fact or clarification about the correct answer, also in Hindi.

Your response must be in the specified JSON format.`,
});

const bazaarQuizFlow = ai.defineFlow(
  {
    name: 'bazaarQuizFlow',
    inputSchema: BazaarQuizInputSchema,
    outputSchema: BazaarQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a bazaar quiz question.");
    }
    return output;
  }
);
