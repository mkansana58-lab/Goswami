
"use server";

import type { ChatInput, ChatResponse } from '@/ai/flows/predict-selection-chance';
import { getChatResponse as getChatResponseFlow } from '@/ai/flows/predict-selection-chance';

export async function predictSelectionChance(input: ChatInput): Promise<ChatResponse | { error: string }> {
  try {
    const result = await getChatResponseFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in AI Chat action:", error);
    return { error: `Sorry, an error occurred while getting a response.` };
  }
}
