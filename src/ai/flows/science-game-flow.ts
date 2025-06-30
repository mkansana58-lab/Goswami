
'use server';
/**
 * @fileOverview An AI flow for generating science-based task questions.
 * 
 * - generateScienceTask - Creates a single science task question.
 * - ScienceGameOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScienceGameOutputSchema = z.object({
    task: z.string().describe('The description of the science task or experiment in Hindi (e.g., "पौधे में पानी देने की प्रक्रिया").'),
    steps: z.array(z.string()).length(4).describe('An array of exactly 4 steps for the task, in a jumbled order, in Hindi.'),
    correctOrder: z.array(z.string()).length(4).describe('The same 4 steps from the "steps" array, but in the correct sequential order.'),
});
export type ScienceGameOutput = z.infer<typeof ScienceGameOutputSchema>;

export async function generateScienceTask(): Promise<ScienceGameOutput> {
  return scienceGameFlow();
}

const prompt = ai.definePrompt({
  name: 'scienceGamePrompt',
  output: { schema: ScienceGameOutputSchema },
  prompt: `You are a science teacher creating a fun task-based question for a game called "विज्ञान गेम".
The goal is to test a student's understanding of a scientific process or experiment by asking them to arrange the steps in the correct order.

Instructions:
1.  Create a simple science task or experiment suitable for a student (e.g., "making a simple circuit", "the water cycle", "planting a seed").
2.  Define 4 clear, distinct steps for this task.
3.  The 'task' field should describe the overall goal in Hindi.
4.  The 'steps' field should contain the 4 steps in a random, jumbled order, in Hindi.
5.  The 'correctOrder' field must contain the exact same 4 strings from 'steps', but arranged in the correct logical sequence.

Your response must be in the specified JSON format.`,
});

const scienceGameFlow = ai.defineFlow(
  {
    name: 'scienceGameFlow',
    outputSchema: ScienceGameOutputSchema,
  },
  async () => {
    const { output } = await prompt({});
    if (!output) {
      throw new Error("AI failed to generate a science game task.");
    }
    return output;
  }
);
