
'use server';
/**
 * @fileOverview An AI flow for generating test questions.
 * 
 * - generateTestQuestions - A function that creates a set of questions for a specific subject and class level.
 * - TestGeneratorInput - The input type for the function.
 * - TestGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TestGeneratorInputSchema = z.object({
  className: z.string().describe('The class level for the questions (e.g., Class 6, Class 9).'),
  subject: z.string().describe('The subject of the questions (e.g., Math, Science, Reasoning).'),
  questionCount: z.number().describe('The number of questions to generate.'),
  language: z.string().describe('The language for the questions and answers (e.g., Hindi, English).'),
});
export type TestGeneratorInput = z.infer<typeof TestGeneratorInputSchema>;

const QuestionSchema = z.object({
    id: z.number().describe('A unique sequential number for the question, starting from 1.'),
    question: z.string().describe('The text of the question.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers.'),
    answer: z.string().describe('The correct answer, which must be one of the strings from the options array.'),
});

const TestGeneratorOutputSchema = z.object({
    questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type TestGeneratorOutput = z.infer<typeof TestGeneratorOutputSchema>;

export async function generateTestQuestions(input: TestGeneratorInput): Promise<TestGeneratorOutput> {
  return testGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'testGeneratorPrompt',
  input: { schema: TestGeneratorInputSchema },
  output: { schema: TestGeneratorOutputSchema },
  prompt: `You are an expert test creator for students preparing for competitive exams like Sainik School, RMS, and JNV in India.
Your task is to generate a set of multiple-choice questions based on the provided specifications.

Instructions:
1.  Generate exactly {{{questionCount}}} questions.
2.  The questions should be for {{{className}}}.
3.  The subject is {{{subject}}}.
4.  All questions and options must be in the {{{language}}} language.
5.  Each question must have exactly 4 options.
6.  The 'answer' field must exactly match one of the strings in the 'options' array.
7.  Ensure the difficulty is appropriate for a competitive entrance exam for {{{className}}}.
8.  The 'id' for each question should be a unique sequential number.

Your response must be in the specified JSON format.`,
});

const testGeneratorFlow = ai.defineFlow(
  {
    name: 'testGeneratorFlow',
    inputSchema: TestGeneratorInputSchema,
    outputSchema: TestGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate test questions.");
    }
    // Re-assign IDs to ensure they are sequential, as the AI might make mistakes.
    const sanitizedQuestions = output.questions.map((q, index) => ({
        ...q,
        id: index + 1,
    }));
    return { questions: sanitizedQuestions };
  }
);
