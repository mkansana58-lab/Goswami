
'use server';
/**
 * @fileOverview AI Tutor flow for answering student questions, with image support.
 *
 * - askTutor - A function that provides an answer, subject, difficulty, and related questions for a student's query.
 * - TutorInput - The input type for the askTutor function.
 * - TutorOutput - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TutorInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  imageDataUri: z.string().optional().describe("An optional image provided by the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TutorInput = z.infer<typeof TutorInputSchema>;

const TutorOutputSchema = z.object({
  answer: z.string().describe('The detailed answer to the student\'s question, explained simply in Hindi.'),
  subject: z.string().describe('The subject of the question (e.g., गणित, विज्ञान, इतिहास).'),
  difficulty: z.string().describe('The difficulty level of the question (e.g., आसान, मध्यम, कठिन).'),
  relatedQuestions: z.array(z.string()).describe('An array of 3-4 related questions in Hindi for practice.'),
});
export type TutorOutput = z.infer<typeof TutorOutputSchema>;

export async function askTutor(input: TutorInput): Promise<TutorOutput> {
  return tutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorInputSchema },
  output: { schema: TutorOutputSchema },
  prompt: `आप एक बहुत ही सहायक और जानकार AI ट्यूटर हैं जो गो स्वामी डिफेंस एकेडमी के छात्रों की मदद करते हैं। आपका काम छात्रों के सवालों का जवाब देना है, जो सैन्य स्कूल, RMS, और JNV जैसी परीक्षाओं की तैयारी कर रहे हैं।

छात्र का प्रश्न: {{{question}}}
{{#if imageDataUri}}
छात्र द्वारा प्रदान की गई छवि:
{{media url=imageDataUri}}
{{/if}}

कृपया निम्नलिखित कार्य करें:
1.  प्रश्न का उत्तर सरल और स्पष्ट हिंदी में दें। यदि कोई छवि प्रदान की गई है, तो अपने उत्तर में उस छवि का विश्लेषण शामिल करें।
2.  बताएं कि यह प्रश्न किस विषय (subject) का है (जैसे - गणित, विज्ञान, इतिहास, भूगोल, आदि)।
3.  प्रश्न का कठिनाई स्तर (difficulty) बताएं (आसान, मध्यम, या कठिन)।
4.  अभ्यास के लिए 3-4 मिलते-जुलते प्रश्न (relatedQuestions) हिंदी में प्रदान करें।

आपका जवाब हमेशा दिए गए JSON प्रारूप में होना चाहिए।`,
});

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI tutor failed to generate a response.");
    }
    return output;
  }
);
