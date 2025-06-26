
'use server';
/**
 * @fileOverview Assesses the difficulty level of a practice problem, provides a solution, and suggests similar problems.
 *
 * - suggestDifficultyLevel - A function that handles the problem assessment process.
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
  difficultyLevel: z.string().describe('The assessed difficulty level of the problem (e.g., Easy, Medium, Hard). This must be in Hindi.'),
  solution: z.string().optional().describe('The detailed solution or answer to the problemText. This must be in Hindi.'),
  feedback: z.string().describe('Feedback on the problem and suggestions for similar problems. This must be in Hindi.'),
});
export type SuggestDifficultyLevelOutput = z.infer<typeof SuggestDifficultyLevelOutputSchema>;

export async function suggestDifficultyLevel(input: SuggestDifficultyLevelInput): Promise<SuggestDifficultyLevelOutput> {
  return suggestDifficultyLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDifficultyLevelPrompt',
  input: {schema: SuggestDifficultyLevelInputSchema},
  output: {schema: SuggestDifficultyLevelOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `You are an AI assistant for Go Swami Defence Academy. Your task is to assess academic problems for students preparing for defence exams.
You MUST provide your entire response (difficultyLevel, solution, feedback) in HINDI using Devanagari script.

Problem: {{{problemText}}}

Your response MUST include these fields:
1. difficultyLevel: Problem difficulty (जैसे: आसान, मध्यम, कठिन).
2. solution: A detailed, step-by-step solution to the problem. If it's a math problem, show all steps.
3. feedback: Provide constructive feedback on the problem and suggest related topics for the student to practice.
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
    if (!output || !output.difficultyLevel || !output.feedback) {
      console.warn("AI Tutor flow did not return expected fields. Output:", output);
      return {
        difficultyLevel: "आकलन करने में असमर्थ",
        solution: "समाधान उत्पन्न नहीं किया जा सका।",
        feedback: "AI इस समय अनुरोध को संसाधित नहीं कर सका। कृपया अपनी समस्या को फिर से लिखने का प्रयास करें या बाद में पुनः प्रयास करें।",
      };
    }
    return output;
  }
);
