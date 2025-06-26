
'use server';
/**
 * @fileOverview A general purpose AI chatbot that can also analyze images.
 *
 * - getChatResponse - Handles getting a response from the AI model.
 * - ChatInput - The input type for the function.
 * - ChatResponse - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s text prompt or question.'),
  photoDataUrl: z.string().optional().describe(
    "An optional photo provided by the user, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
}

const ChatResponseSchema = z.object({
  response: z.string().describe('The AI model\'s textual response to the user.'),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export async function getChatResponse(input: ChatInput): Promise<ChatResponse> {
  return getChatResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getChatResponsePrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatResponseSchema},
  prompt: `
    You are a helpful and friendly AI assistant for the Go Swami Defence Academy.
    Your primary goal is to answer questions related to the academy, its courses, admission processes, and general queries about defence careers in India.
    Be polite, informative, and encouraging.
    If the user provides an image, analyze it in the context of their question. For example, if they ask "What is this document?", describe the document.
    
    User's Question: {{{prompt}}}
    
    {{#if photoDataUrl}}
    User has provided an image to analyze.
    Image: {{media url=photoDataUrl}}
    {{/if}}

    Your entire response should be within the 'response' field of the JSON output.
  `,
});

const getChatResponseFlow = ai.defineFlow(
  {
    name: 'getChatResponseFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatResponseSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        response: 'Sorry, I could not process your request at the moment. Please try again.',
      };
    }
    return output;
  }
);
