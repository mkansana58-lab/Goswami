
"use server";

import type { GenerateCurrentAffairsInput, GenerateCurrentAffairsOutput } from '@/ai/flows/generate-current-affairs-flow';
import { generateCurrentAffairs as generateCurrentAffairsFlow } from '@/ai/flows/generate-current-affairs-flow';

export async function getAIGeneratedCurrentAffairs(input: GenerateCurrentAffairsInput): Promise<GenerateCurrentAffairsOutput | { error: string }> {
  try {
    const result = await generateCurrentAffairsFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in AI Current Affairs generation flow:", error);
    const errorMessage = input.language === 'hi' ? "क्षमा करें, करेंट अफेयर्स उत्पन्न करने में एक त्रुटि हुई।" : "Sorry, an error occurred while generating current affairs.";
    return { error: `${errorMessage} ${error.message ? `(${error.message})` : ''}` };
  }
}
