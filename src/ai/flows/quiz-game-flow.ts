'use server';
/**
 * @fileOverview An AI flow for generating quiz game questions.
 * 
 * - generateQuizQuestion - A function that creates a single quiz question.
 * - QuizGameInput - The input type for the function.
 * - QuizGameOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuizGameInputSchema = z.object({
  subject: z.string().describe('The subject for the quiz question (e.g., Math, Science, History).'),
  difficulty: z.string().describe('The difficulty level of the question, corresponding to a prize amount (e.g., "for ₹1,000", "for ₹50,000", "for ₹1 Crore").'),
});
export type QuizGameInput = z.infer<typeof QuizGameInputSchema>;

const QuizGameOutputSchema = z.object({
    question: z.string().describe('The text of the question.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
    explanation: z.string().describe('A brief, simple explanation of the correct answer in Hindi.'),
});
export type QuizGameOutput = z.infer<typeof QuizGameOutputSchema>;

export async function generateQuizQuestion(input: QuizGameInput): Promise<QuizGameOutput> {
  return quizGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizGamePrompt',
  input: { schema: QuizGameInputSchema },
  output: { schema: QuizGameOutputSchema },
  prompt: `You are a fun and engaging quiz master for a game like "Kaun Banega Crorepati".
Your task is to generate one multiple-choice question in Hindi.

Instructions:
1.  The question should be from the subject: {{{subject}}}.
2.  The difficulty should be appropriate for the prize level: {{{difficulty}}}. Lower amounts are easy, higher amounts are very difficult.
3.  The question and all options must be in Hindi.
4.  Generate exactly 4 options.
5.  The 'answer' field must exactly match one of the strings in the 'options' array.
6.  The 'explanation' field should provide a simple, interesting fact or clarification about the correct answer, also in Hindi.

Your response must be in the specified JSON format.`,
});

const quizGameFlow = ai.defineFlow(
  {
    name: 'quizGameFlow',
    inputSchema: QuizGameInputSchema,
    outputSchema: QuizGameOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a quiz question.");
    }
    return output;
  }
);
