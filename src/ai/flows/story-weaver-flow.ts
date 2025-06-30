
'use server';
/**
 * @fileOverview An AI flow for generating reading passages and comprehension questions.
 * 
 * - generatePassageWithQuestions - Creates a passage and related multiple-choice questions.
 * - PassageGeneratorInput - The input type for the function.
 * - PassageGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PassageGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic for the passage (e.g., "A brave lion", "The solar system").'),
  language: z.string().describe('The language for the passage and questions (e.g., "Hindi", "English").'),
});
export type PassageGeneratorInput = z.infer<typeof PassageGeneratorInputSchema>;

const QuestionSchema = z.object({
    question: z.string().describe('The multiple-choice question based on the passage.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
});

const PassageGeneratorOutputSchema = z.object({
    passage: z.string().describe('The generated reading passage.'),
    questions: z.array(QuestionSchema).min(3).max(5).describe('An array of 3 to 5 comprehension questions.'),
});
export type PassageGeneratorOutput = z.infer<typeof PassageGeneratorOutputSchema>;

export async function generatePassageWithQuestions(input: PassageGeneratorInput): Promise<PassageGeneratorOutput> {
  return passageGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'passageGeneratorPrompt',
  input: { schema: PassageGeneratorInputSchema },
  output: { schema: PassageGeneratorOutputSchema },
  prompt: `You are an expert educator who creates reading comprehension exercises for students.
Your task is to generate a short, engaging passage in {{{language}}} and 3 to 5 multiple-choice questions based on it.

Instructions:
1.  The passage should be about the topic: {{{topic}}}.
2.  The passage and all questions must be in the {{{language}}} language.
3.  The passage should be approximately 150-200 words long.
4.  Generate between 3 and 5 multiple-choice questions that test the understanding of the passage.
5.  Each question must have exactly 4 options.
6.  The 'answer' for each question must exactly match one of the strings in its 'options' array.

Your response must be in the specified JSON format.`,
});

const passageGeneratorFlow = ai.defineFlow(
  {
    name: 'passageGeneratorFlow',
    inputSchema: PassageGeneratorInputSchema,
    outputSchema: PassageGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate the passage and questions.");
    }
    return output;
  }
);
