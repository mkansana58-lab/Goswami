
"use server";

import type { SuggestDifficultyLevelInput, SuggestDifficultyLevelOutput } from '@/ai/flows/suggest-difficulty-level';
import { suggestDifficultyLevel as suggestDifficultyLevelFlow } from '@/ai/flows/suggest-difficulty-level';

export async function getDifficultySuggestion(input: SuggestDifficultyLevelInput): Promise<SuggestDifficultyLevelOutput | { error: string }> {
  try {
    const result = await suggestDifficultyLevelFlow(input);
    // The flow now handles basic error structure, so if result.difficultyLevel indicates an error, it's from the flow's fallback
    if (result.difficultyLevel.toLowerCase().includes("unable to assess") || result.difficultyLevel.includes("असमर्थ")) {
        // You could return the structured error from the flow directly
        // or re-wrap it if needed. Here, we'll just pass it through.
        return result;
    }
    return result;
  } catch (error: any) {
    console.error("Error in AI Tutor suggestion flow (action):", error);
    const isHindi = /[\u0900-\u097F]/.test(input.problemText);
    return { 
        error: isHindi ? "सुझाव प्राप्त करने में विफल। कृपया पुनः प्रयास करें।" : "Failed to get suggestion. Please try again.",
        // Ensure the error object matches SuggestDifficultyLevelOutput if that's what UI expects for error display
        // For simplicity, returning a distinct error object. The UI must handle this shape.
        // OR, to match the flow's error structure:
        // difficultyLevel: isHindi ? "त्रुटि" : "Error",
        // feedback: isHindi ? "सुझाव प्राप्त करने में विफल।" : "Failed to get suggestion.",
        // solution: isHindi ? "समाधान उपलब्ध नहीं है।" : "Solution not available."
     };
  }
}
