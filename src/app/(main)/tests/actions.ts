
"use server";

import type { GenerateTestPaperInput, TestPaper } from '@/ai/flows/generate-test-paper-flow';
import { generateTestPaper as generateTestPaperFlow } from '@/ai/flows/generate-test-paper-flow';

export async function generateAIMockTest(input: GenerateTestPaperInput): Promise<TestPaper | { error: string }> {
  try {
    const result = await generateTestPaperFlow(input);
     // The flow itself now handles basic error/fallback structure,
     // so we can check if the title indicates an error from the flow.
    if (result.title.toLowerCase().includes("error")) {
      const firstQuestionText = result.subjects[0]?.questions[0]?.questionText || (input.language === 'hi' ? 'एक अज्ञात त्रुटि हुई।' : 'An unknown error occurred.');
      return { error: firstQuestionText };
    }
    return result;
  } catch (error: any) {
    console.error("Error in AI Test Paper generation action:", error);
    const errorMessage = input.language === 'hi' ? "क्षमा करें, टेस्ट पेपर उत्पन्न करने में एक त्रुटि हुई।" : "Sorry, an error occurred while generating the test paper.";
    return { error: `${errorMessage} ${error.message ? `(${error.message})` : ''}` };
  }
}
