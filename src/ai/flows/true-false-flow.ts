
'use server';
/**
 * @fileOverview An AI flow for generating True/False questions.
 * 
 * - generateTrueFalseQuestion - Creates a single true/false question with an explanation.
 * - TrueFalseInput - The input type for the function.
 * - TrueFalseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TrueFalseInputSchema = z.object({
  subject: z.string().describe('The subject for the question (e.g., "Science", "History").'),
});
export type TrueFalseInput = z.infer<typeof TrueFalseInputSchema>;

const TrueFalseOutputSchema = z.object({
    statement: z.string().describe('The true or false statement in Hindi.'),
    isTrue: z.boolean().describe('Whether the statement is true or false.'),
    explanation: z.string().describe('A brief, simple explanation of why the statement is true or false, in Hindi.'),
});
export type TrueFalseOutput = z.infer<typeof TrueFalseOutputSchema>;

export async function generateTrueFalseQuestion(input: TrueFalseInput): Promise<TrueFalseOutput> {
  return trueFalseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trueFalsePrompt',
  input: { schema: TrueFalseInputSchema },
  output: { schema: TrueFalseOutputSchema },
  prompt: `You are a fun quiz master who creates interesting "True or False" questions for students in Hindi.

Instructions:
1.  Create a single, interesting statement on the subject of: {{{subject}}}.
2.  The statement should be something that makes a student think. It should not be too obvious.
3.  The statement and explanation must be in Hindi.
4.  Determine if the statement is true or false and set the 'isTrue' field correctly.
5.  Provide a short, simple, and interesting explanation in the 'explanation' field that clarifies the answer.

Your response must be in the specified JSON format.`,
});

const trueFalseFlow = ai.defineFlow(
  {
    name: 'trueFalseFlow',
    inputSchema: TrueFalseInputSchema,
    outputSchema: TrueFalseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a true/false question.");
    }
    return output;
  }
);
