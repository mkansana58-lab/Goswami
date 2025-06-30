
'use server';
/**
 * @fileOverview An AI flow for collaborative storytelling.
 *
 * - startStory - Begins a new story.
 * - continueStory - Adds the next line to an existing story.
 * - StoryWeaverInput - Input for continueStory.
 * - StoryWeaverOutput - Output for both functions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StoryWeaverInputSchema = z.object({
  currentStory: z.string().describe('The story so far.'),
});
export type StoryWeaverInput = z.infer<typeof StoryWeaverInputSchema>;

const StoryWeaverOutputSchema = z.object({
  nextLine: z.string().describe('The next line of the story.'),
});
export type StoryWeaverOutput = z.infer<typeof StoryWeaverOutputSchema>;

// Flow to generate the very first line of a new story
export async function startStory(): Promise<StoryWeaverOutput> {
  const prompt = ai.definePrompt({
    name: 'startStoryPrompt',
    output: { schema: StoryWeaverOutputSchema },
    prompt: `You are a master storyteller starting a new, exciting adventure story for kids.
    Your task is to write only the very first, captivating opening line.
    The line should be in Hindi and end with an ellipsis (...) to invite others to continue.
    Example: "एक घने जंगल के बीचों-बीच, एक जादुई झरना बहता था..."
    
    Provide your response in the specified JSON format.`,
  });

  const { output } = await prompt({});
  if (!output) {
    throw new Error('AI failed to start a story.');
  }
  return output;
}

// Flow to have the AI continue the story
export async function continueStory(input: StoryWeaverInput): Promise<StoryWeaverOutput> {
  const prompt = ai.definePrompt({
    name: 'continueStoryPrompt',
    input: { schema: StoryWeaverInputSchema },
    output: { schema: StoryWeaverOutputSchema },
    prompt: `You are a collaborative storyteller. Given the story so far, add the next engaging line.
    The story is in Hindi. Your line must also be in Hindi.
    Keep it concise and end with an ellipsis (...) to invite the next person to continue.

    Story so far:
    {{{currentStory}}}

    Your next line:`,
  });

  const { output } = await prompt(input);
  if (!output) {
    throw new Error('AI failed to continue the story.');
  }
  return output;
}
