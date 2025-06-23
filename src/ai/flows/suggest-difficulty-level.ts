
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
  difficultyLevel: z.string().describe('The assessed difficulty level of the problem (e.g., Easy, Medium, Hard).'),
  solution: z.string().optional().describe('The detailed solution or answer to the problemText. Respond in the language of the input problem text.'),
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
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  },
  prompt: `You are an AI assistant that assesses the difficulty level of practice problems for students. You also provide the solution to the problem, feedback on the problem, and suggestions for similar problems.
The problem text can be in English or Hindi. Please provide your assessment, solution, and feedback in the same language as the input problem text.

Problem: {{{problemText}}}

Your response MUST include these fields:
1. difficultyLevel: (Easy, Medium, Hard, or an equivalent in the input language)
2. solution: (The detailed solution to the problemText. If the problem is subjective or does not have a single definitive answer, explain this and provide guidance. If it's a math problem, show steps.)
3. feedback: (Feedback on the problem itself, its clarity, and suggestions for similar problems or areas to focus on.)
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
      const isHindi = /[\u0900-\u097F]/.test(input.problemText);
      return {
        difficultyLevel: isHindi ? "आकलन करने में असमर्थ" : "Unable to Assess",
        solution: isHindi ? "समाधान उत्पन्न नहीं किया जा सका।" : "A solution could not be generated.",
        feedback: isHindi ? "AI इस समय अनुरोध को संसाधित नहीं कर सका। कृपया अपनी समस्या को फिर से लिखने का प्रयास करें या बाद में पुनः प्रयास करें।" : "The AI could not process the request at this time. Please try rephrasing your problem or try again later.",
      };
    }
    return output;
  }
);
