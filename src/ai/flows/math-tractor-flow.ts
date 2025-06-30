
'use server';
/**
 * @fileOverview An AI flow for generating math problems for a tractor game.
 * 
 * - generateMathQuestion - Creates a single math question.
 * - MathQuestionInput - The input type for the function.
 * - MathQuestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MathQuestionInputSchema = z.object({
  level: z.number().min(0).describe('The current level of the game, used to determine difficulty.'),
});
export type MathQuestionInput = z.infer<typeof MathQuestionInputSchema>;

const MathQuestionOutputSchema = z.object({
    question: z.string().describe('The math problem, written as a simple string or a short word problem (e.g., "15 + 7 = ?", "50 का 20% कितना है?").'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 possible numeric answers as strings.'),
    answer: z.string().describe('The correct numeric answer, which must be one of the strings from the options array.'),
});
export type MathQuestionOutput = z.infer<typeof MathQuestionOutputSchema>;

export async function generateMathQuestion(input: MathQuestionInput): Promise<MathQuestionOutput> {
  return mathQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mathQuestionPrompt',
  input: { schema: MathQuestionInputSchema },
  output: { schema: MathQuestionOutputSchema },
  prompt: `You are a math teacher creating questions for a fun tractor racing game for kids (Class 4-8 level).
The difficulty should increase with the level. All questions and answers should be in Hindi.

Level: {{{level}}}

Instructions:
1.  Based on the level, create an appropriate math problem.
    - Level 0-3: Simple addition/subtraction (e.g., 45 + 18, 95 - 36).
    - Level 4-7: Simple multiplication/division (e.g., 22 * 6, 81 / 3).
    - Level 8-12: Simple percentages (e.g., "150 का 30% कितना है?", "40, 200 का कितना प्रतिशत है?").
    - Level 13-16: Simple profit and loss word problems (e.g., "एक किताब ₹100 में खरीदकर ₹120 में बेची गई। लाभ कितना हुआ?").
    - Level 17-20: Simple interest problems (e.g., "₹5000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?").
    - Level 21+: More complex problems combining operations, percentages, profit/loss, or simple geometry area questions.
2.  The 'question' should be a string, either as an equation or a short word problem in Hindi.
3.  The 'answer' must be the correct numeric result as a string (e.g., "20", "300").
4.  Generate 3 incorrect but plausible options (distractors). The distractors should be numerically close or common mistakes.
5.  The 'options' array must contain the correct answer and 3 distractors, shuffled.
6.  All options and the answer must be strings.

Your response must be in the specified JSON format.`,
});

const mathQuestionFlow = ai.defineFlow(
  {
    name: 'mathQuestionFlow',
    inputSchema: MathQuestionInputSchema,
    outputSchema: MathQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a math question.");
    }
    return output;
  }
);
