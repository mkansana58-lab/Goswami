
'use server';
/**
 * @fileOverview Assesses the difficulty level of a practice problem and suggests similar problems.
 *
 * - suggestDifficultyLevel - A function that handles the problem difficulty assessment process.
 * - SuggestDifficultyLevelInput - The input type for the suggestDifficultyLevel function.
 * - SuggestDifficultyLevelOutput - The return type for the suggestDifficultyLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDifficultyLevelInputSchema = z.object({
  problemText: z.string().describe('The text of the practice problem to assess. This can be in English or Hindi.'),
});
export type SuggestDifficultyLevelInput = z.infer<typeof SuggestDifficultyLevelInputSchema>;

const SuggestDifficultyLevelOutputSchema = z.object({
  difficultyLevel: z.string().describe('The assessed difficulty level of the problem (e.g., Easy, Medium, Hard).'),
  feedback: z.string().describe('Feedback on the problem and suggestions for similar problems. Respond in the language of the input problem text.'),
});
export type SuggestDifficultyLevelOutput = z.infer<typeof SuggestDifficultyLevelOutputSchema>;

export async function suggestDifficultyLevel(input: SuggestDifficultyLevelInput): Promise<SuggestDifficultyLevelOutput> {
  return suggestDifficultyLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDifficultyLevelPrompt',
  input: {schema: SuggestDifficultyLevelInputSchema},
  output: {schema: SuggestDifficultyLevelOutputSchema},
  prompt: `You are an AI assistant that assesses the difficulty level of practice problems for students and provides feedback and suggestions for similar problems.
The problem text can be in English or Hindi. Please provide your assessment and feedback in the same language as the input problem text.

Assess the difficulty level of the following problem and provide feedback and suggestions:

Problem: {{{problemText}}}
  `,
});

const suggestDifficultyLevelFlow = ai.defineFlow(
  {
    name: 'suggestDifficultyLevelFlow',
    inputSchema: SuggestDifficultyLevelInputSchema,
    outputSchema: SuggestDifficultyLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

