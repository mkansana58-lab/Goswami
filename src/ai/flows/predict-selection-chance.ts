
'use server';
/**
 * @fileOverview Predicts a student's selection chance based on exam performance.
 *
 * - predictSelectionChance - A function that handles the chance prediction.
 * - PredictSelectionChanceInput - The input type for the function.
 * - PredictSelectionChanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSelectionChanceInputSchema = z.object({
  examName: z.string().describe('The name of the examination taken by the student.'),
  totalMarks: z.number().positive().describe('The total marks possible in the examination.'),
  obtainedMarks: z.number().min(0).describe('The marks obtained by the student in the examination.'),
  language: z.enum(['en', 'hi']).describe('The language for the output response (English or Hindi).')
});
export type PredictSelectionChanceInput = z.infer<typeof PredictSelectionChanceInputSchema>;

const PredictSelectionChanceOutputSchema = z.object({
  chanceAssessment: z.string().describe('A textual assessment of the student\'s selection chances.'),
  advice: z.string().describe('Advice for the student based on their performance.'),
  certificateText: z.string().describe('A short "chance certificate" summary text. Avoid markdown or complex formatting.')
});
export type PredictSelectionChanceOutput = z.infer<typeof PredictSelectionChanceOutputSchema>;

export async function predictSelectionChance(input: PredictSelectionChanceInput): Promise<PredictSelectionChanceOutput> {
  if (input.obtainedMarks > input.totalMarks) {
    const errorMsg = input.language === 'hi' ? 'प्राप्तांक कुल अंकों से अधिक नहीं हो सकते।' : 'Obtained marks cannot be greater than total marks.';
    // This is a simple validation, more complex logic could be here or in the calling component.
    // For a real application, throwing an error might be better.
    return {
        chanceAssessment: errorMsg,
        advice: input.language === 'hi' ? 'कृपया सही अंक दर्ज करें।' : 'Please enter correct marks.',
        certificateText: errorMsg,
    };
  }
  return predictSelectionChanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSelectionChancePrompt',
  input: {schema: PredictSelectionChanceInputSchema},
  output: {schema: PredictSelectionChanceOutputSchema},
  prompt: `
    You are an expert career counselor for a defence academy.
    A student has provided their exam performance and needs an assessment of their selection chances.
    The response should be in {{language}}.

    Exam Name: {{{examName}}}
    Total Marks: {{{totalMarks}}}
    Obtained Marks: {{{obtainedMarks}}}

    Based on these details:
    1.  Provide a realistic 'chanceAssessment' (e.g., Very High, High, Moderate, Low, Very Low). Consider a score above 80% as Very High, 70-80% as High, 60-70% as Moderate, 50-60% as Low, and below 50% as Very Low.
    2.  Offer constructive 'advice' to the student. If chances are low, suggest areas for improvement. If high, suggest how to maintain or further improve.
    3.  Generate a concise 'certificateText' (1-2 sentences) summarizing their potential, like a motivational statement for a certificate. For example: "With {{obtainedMarks}}/{{totalMarks}} in {{examName}}, your chances are looking {{chanceAssessment}}. Keep up the hard work!" or in Hindi: "{{{examName}}} में {{totalMarks}} में से {{obtainedMarks}} अंकों के साथ, आपके चयन की संभावनाएं {{chanceAssessment}} हैं। कड़ी मेहनत जारी रखें!"

    Respond in {{language}}. For Hindi responses, use Devanagari script.
    Example for 'chanceAssessment' in Hindi: बहुत उच्च, उच्च, मध्यम, निम्न, बहुत निम्न.
  `,
});

const predictSelectionChanceFlow = ai.defineFlow(
  {
    name: 'predictSelectionChanceFlow',
    inputSchema: PredictSelectionChanceInputSchema,
    outputSchema: PredictSelectionChanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback or error handling if output is null/undefined
      const errorMsg = input.language === 'hi' ? 'क्षमा करें, अभी मूल्यांकन संभव नहीं है।' : 'Sorry, assessment is not possible at the moment.';
      return {
        chanceAssessment: errorMsg,
        advice: errorMsg,
        certificateText: errorMsg,
      };
    }
    return output;
  }
);
