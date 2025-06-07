
"use server";

import type { SuggestDifficultyLevelInput, SuggestDifficultyLevelOutput } from '@/ai/flows/suggest-difficulty-level';
import { suggestDifficultyLevel as suggestDifficultyLevelFlow } from '@/ai/flows/suggest-difficulty-level';

export async function getDifficultySuggestion(input: SuggestDifficultyLevelInput): Promise<SuggestDifficultyLevelOutput | { error: string }> {
  try {
    const result = await suggestDifficultyLevelFlow(input);
    return result;
  } catch (error) {
    console.error("Error in AI Tutor suggestion flow:", error);
    return { error: "Failed to get suggestion. Please try again." };
  }
}
