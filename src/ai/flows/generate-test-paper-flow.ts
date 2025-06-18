
'use server';
/**
 * @fileOverview Generates a test paper with questions for multiple subjects using an AI model.
 *
 * - generateTestPaper - A function that handles the test paper generation.
 * - GenerateTestPaperInput - The input type for the function.
 * - TestPaper, TestSubject, TestQuestion - The output types for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestQuestionSchema = z.object({
  questionText: z.string().describe('The main text of the question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly four multiple-choice options.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct option in the options array.'),
  explanation: z.string().optional().describe('A brief explanation for the correct answer (optional).')
});
export type TestQuestion = z.infer<typeof TestQuestionSchema>;

const TestSubjectSchema = z.object({
  subjectName: z.string().describe('The name of the subject (e.g., English, Mathematics, General Knowledge).'),
  questions: z.array(TestQuestionSchema).describe('An array of questions for this subject.')
});
export type TestSubject = z.infer<typeof TestSubjectSchema>;

const GenerateTestPaperInputSchema = z.object({
  studentClass: z.string().describe('The class level of the student (e.g., "Class 6", "Class 10"). This will determine the difficulty.'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the test paper (English or Hindi).')
});
export type GenerateTestPaperInput = z.infer<typeof GenerateTestPaperInputSchema>;

const TestPaperSchema = z.object({
  title: z.string().describe('A suitable title for the generated test paper (e.g., "Model Test Paper for Class 8").'),
  subjects: z.array(TestSubjectSchema).length(3).describe('An array of 3 subjects: English, Mathematics, and General Knowledge.')
});
export type TestPaper = z.infer<typeof TestPaperSchema>;

export async function generateTestPaper(input: GenerateTestPaperInput): Promise<TestPaper> {
  return generateTestPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestPaperPrompt',
  input: {schema: GenerateTestPaperInputSchema},
  output: {schema: TestPaperSchema},
  prompt: `
    You are an expert question paper setter for competitive defence academy entrance exams.
    Your task is to generate a model test paper for a student of {{{studentClass}}}.
    The test paper must be in the {{language}} language. If Hindi, use Devanagari script.
    The test paper should have a suitable title.
    The test paper must contain exactly 3 subjects:
    1.  English: 10 multiple-choice questions.
    2.  Mathematics: 10 multiple-choice questions.
    3.  General Knowledge (GK): 10 multiple-choice questions.

    For each question:
    - Provide the main question text.
    - Provide exactly 4 multiple-choice options.
    - Indicate the 0-based index of the correct answer.
    - Optionally, provide a brief explanation for the correct answer.

    The difficulty level of the questions should be appropriate for a student in {{{studentClass}}} preparing for defence academy entrance.
    Focus on topics relevant to Sainik School, Military School, NDA foundation type exams.

    Ensure your output strictly follows the JSON schema provided for TestPaper, TestSubject, and TestQuestion.
    Each subject must have exactly 10 questions.
  `,
});

const generateTestPaperFlow = ai.defineFlow(
  {
    name: 'generateTestPaperFlow',
    inputSchema: GenerateTestPaperInputSchema,
    outputSchema: TestPaperSchema,
  },
  async (input) => {
    console.log('generateTestPaperFlow: Invoked with input:', input);
    try {
      const {output} = await prompt(input);
      if (!output || !output.subjects || output.subjects.length !== 3 || output.subjects.some(s => s.questions.length !== 10)) {
        console.warn('generateTestPaperFlow: AI returned invalid or incomplete data. Using fallback.');
        throw new Error(input.language === 'hi' ? 'क्षमा करें, AI मॉडल पेपर बनाने में असमर्थ था। कृपया पुनः प्रयास करें।' : 'Sorry, the AI was unable to generate the model paper. Please try again.');
      }
      console.log('generateTestPaperFlow: Successfully generated test paper.');
      return output;
    } catch (error: any) {
        console.error('generateTestPaperFlow: Error during generation:', error);
        const errorMessage = input.language === 'hi' ? 'मॉडल पेपर बनाते समय एक त्रुटि हुई।' : 'An error occurred while generating the model paper.';
        // Construct a fallback TestPaper object to satisfy the schema and signal an error.
        return {
            title: input.language === 'hi' ? 'त्रुटि: मॉडल पेपर उत्पन्न नहीं हो सका' : 'Error: Could Not Generate Model Paper',
            subjects: [
                { subjectName: 'English', questions: [{ questionText: errorMessage, options: ['N/A', 'N/A', 'N/A', 'N/A'], correctAnswerIndex: 0, explanation: error.message || (input.language === 'hi' ? 'अज्ञात त्रुटि' : 'Unknown error') }] },
                { subjectName: 'Mathematics', questions: [{ questionText: errorMessage, options: ['N/A', 'N/A', 'N/A', 'N/A'], correctAnswerIndex: 0, explanation: error.message || (input.language === 'hi' ? 'अज्ञात त्रुटि' : 'Unknown error') }] },
                { subjectName: 'General Knowledge', questions: [{ questionText: errorMessage, options: ['N/A', 'N/A', 'N/A', 'N/A'], correctAnswerIndex: 0, explanation: error.message || (input.language === 'hi' ? 'अज्ञात त्रुटि' : 'Unknown error') }] },
            ]
        };
    }
  }
);
