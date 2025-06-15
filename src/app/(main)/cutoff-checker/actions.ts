
"use server";

import type { PredictSelectionChanceInput, PredictSelectionChanceOutput } from '@/ai/flows/predict-selection-chance';
import { predictSelectionChance as predictSelectionChanceFlow } from '@/ai/flows/predict-selection-chance';

export async function predictSelectionChance(input: PredictSelectionChanceInput): Promise<PredictSelectionChanceOutput | { error: string }> {
  try {
    // Basic validation, can be expanded or handled by Zod in the flow itself
    if (input.obtainedMarks > input.totalMarks) {
      return { error: input.language === 'hi' ? "प्राप्तांक कुल अंकों से अधिक नहीं हो सकते।" : "Obtained marks cannot be greater than total marks." };
    }
    const result = await predictSelectionChanceFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in cut-off checker action (predictSelectionChance):", error);
    const errorMessage = input.language === 'hi' ? "क्षमा करें, आपके चयन की संभावना का अनुमान लगाने में एक त्रुटि हुई।" : "Sorry, an error occurred while predicting your selection chance.";
    return { error: `${errorMessage} ${error.message ? `(${error.message})` : ''}` };
  }
}
