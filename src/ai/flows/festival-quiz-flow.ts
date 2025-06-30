
'use server';
/**
 * @fileOverview An AI flow for generating festival-themed quiz questions.
 * 
 * - generateFestivalQuestion - A function that creates a single quiz question about a festival.
 * - FestivalQuizInput - The input type for the function.
 * - FestivalQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FestivalQuizInputSchema = z.object({
  festival: z.string().describe('The Indian festival for the quiz question (e.g., "Diwali", "Holi").'),
});
export type FestivalQuizInput = z.infer<typeof FestivalQuizInputSchema>;

const FestivalQuizOutputSchema = z.object({
    question: z.string().describe('The text of the question in Hindi.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers in Hindi.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
    explanation: z.string().describe('A brief, simple explanation of the correct answer in Hindi.'),
});
export type FestivalQuizOutput = z.infer<typeof FestivalQuizOutputSchema>;

export async function generateFestivalQuestion(input: FestivalQuizInput): Promise<FestivalQuizOutput> {
  return festivalQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'festivalQuizPrompt',
  input: { schema: FestivalQuizInputSchema },
  output: { schema: FestivalQuizOutputSchema },
  prompt: `You are a quiz master creating a fun, festival-themed question for kids in Hindi.
The question should be about the festival: {{{festival}}}.
The question should be of a moderate to high difficulty level suitable for competitive exam preparation. Ensure the question is interesting and tests deeper knowledge about the festival.
Generate one multiple-choice question with 4 options.
The question and all options must be in Hindi.
The 'answer' field must exactly match one of the strings in the 'options' array.
The 'explanation' field should provide a simple clarification about the correct answer in Hindi.
Your response must be in the specified JSON format.`,
});

const festivalQuizFlow = ai.defineFlow(
  {
    name: 'festivalQuizFlow',
    inputSchema: FestivalQuizInputSchema,
    outputSchema: FestivalQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a festival quiz question.");
    }
    return output;
  }
);
