
'use server';
/**
 * @fileOverview An AI flow for checking selection chances based on exam scores.
 * 
 * - checkCutoff - A function that analyzes exam scores and provides feedback.
 * - CutoffCheckerInput - The input type for the function.
 * - CutoffCheckerOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CutoffCheckerInputSchema = z.object({
  examName: z.string().describe('The name of the competitive exam (e.g., Sainik School Class 6, RMS Class 9).'),
  totalMarks: z.coerce.number().min(1).describe('The total possible marks in the exam.'),
  obtainedMarks: z.coerce.number().min(0).describe('The marks obtained by the student.'),
});
export type CutoffCheckerInput = z.infer<typeof CutoffCheckerInputSchema>;


const CutoffCheckerOutputSchema = z.object({
  selectionChance: z.string().describe('A qualitative chance of selection in Hindi (e.g., "बहुत उच्च", "उच्च", "मध्यम", "कम").'),
  analysis: z.string().describe('A brief, encouraging analysis of the performance in 2-3 sentences in Hindi.'),
  advice: z.string().describe('A short, actionable piece of advice for the student for improvement in Hindi.'),
});
export type CutoffCheckerOutput = z.infer<typeof CutoffCheckerOutputSchema>;


export async function checkCutoff(input: CutoffCheckerInput): Promise<CutoffCheckerOutput> {
  return cutoffCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cutoffCheckerPrompt',
  input: { schema: CutoffCheckerInputSchema },
  output: { schema: CutoffCheckerOutputSchema },
  prompt: `आप एक अनुभवी करियर काउंसलर हैं जो भारत में सैनिक स्कूल, RMS, और JNV जैसी प्रतियोगी परीक्षाओं के लिए छात्रों का मार्गदर्शन करते हैं।
आपकी भूमिका छात्र के अंकों के आधार पर उनके चयन की संभावना का विश्लेषण करना और उन्हें सकारात्मक प्रतिक्रिया देना है।

छात्र का विवरण:
- परीक्षा का नाम: {{{examName}}}
- कुल अंक: {{{totalMarks}}}
- प्राप्त अंक: {{{obtainedMarks}}}

निर्देश:
1.  छात्र के प्रतिशत की गणना करें (प्राप्त अंक / कुल अंक * 100)।
2.  प्रतियोगी परीक्षाओं की सामान्य कट-ऑफ के आधार पर चयन की संभावना का अनुमान लगाएं।
    - >85%: बहुत उच्च (Very High)
    - 70-85%: उच्च (High)
    - 55-70%: मध्यम (Medium)
    - <55%: कम (Low)
3.  'selectionChance' फील्ड में हिंदी में संभावना बताएं।
4.  'analysis' फील्ड में हिंदी में 2-3 वाक्यों में छात्र के प्रदर्शन का संक्षिप्त और उत्साहजनक विश्लेषण लिखें।
5.  'advice' फील्ड में हिंदी में सुधार के लिए एक छोटी और व्यावहारिक सलाह दें।

आपका जवाब हमेशा दिए गए JSON प्रारूप में होना चाहिए।`,
});

const cutoffCheckerFlow = ai.defineFlow(
  {
    name: 'cutoffCheckerFlow',
    inputSchema: CutoffCheckerInputSchema,
    outputSchema: CutoffCheckerOutputSchema,
  },
  async (input) => {
    // Basic validation
    if (input.obtainedMarks > input.totalMarks) {
        return {
            selectionChance: "त्रुटि",
            analysis: "आपके द्वारा प्राप्त अंक कुल अंकों से अधिक हैं। कृपया सही अंक दर्ज करें।",
            advice: "अंकों की दोबारा जाँच करें और फिर से प्रयास करें।"
        };
    }

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate cutoff analysis.");
    }
    return output;
  }
);
