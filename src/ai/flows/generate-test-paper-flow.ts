
'use server';
/**
 * @fileOverview Generates a test paper with questions for one or more subjects using an AI model.
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
  explanation: z.string().optional().describe('A brief explanation for the correct answer (optional). Respond in the language of the input test paper language.')
});
export type TestQuestion = z.infer<typeof TestQuestionSchema>;

const TestSubjectSchema = z.object({
  subjectName: z.string().describe('The name of the subject (e.g., Mathematics, General Knowledge). If language is Hindi, provide Hindi subject names like गणित, सामान्य ज्ञान, तर्कशक्ति, हिंदी.'),
  questions: z.array(TestQuestionSchema).describe('An array of questions for this subject.')
});
export type TestSubject = z.infer<typeof TestSubjectSchema>;

const GenerateTestPaperInputSchema = z.object({
  studentClass: z.string().describe('The class level of the student (e.g., "Class 6", "Class 9"). This will determine the difficulty.'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the test paper (English or Hindi).'),
  subjectName: z.enum(['Mathematics', 'General Knowledge', 'Reasoning', 'Hindi', 'English']).optional().describe('The specific subject for the test. If omitted, a default multi-subject test is generated.')
});
export type GenerateTestPaperInput = z.infer<typeof GenerateTestPaperInputSchema>;

const TestPaperSchema = z.object({
  title: z.string().describe('A suitable title for the generated test paper (e.g., "Model Test Paper for Class 9 - Mathematics"). This title must also be in the specified language.'),
  subjects: z.array(TestSubjectSchema).min(1).describe('An array of subjects. If a specific subject was requested, this will contain only that one subject.')
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
    You are an expert question paper setter for competitive defence academy entrance exams in India.
    Your task is to generate a model test paper for a student of {{{studentClass}}}.

    The test paper, including the main title, all subject names, all question text, all options, and any explanations, MUST be in the {{language}} language.
    If the language is 'hi' (Hindi), ALL content (title, subject names, questions, options, explanations) MUST be in Devanagari script.

    {{#if subjectName}}
    The test paper must contain exactly ONE subject: {{{subjectName}}}.
    Generate exactly 10 multiple-choice questions for this subject.
    For Hindi, the subject name should be the Hindi translation (e.g., 'Mathematics' becomes 'गणित', 'Reasoning' becomes 'तर्कशक्ति').
    The title of the test paper should reflect the single subject, e.g., "Class 9 Mathematics Model Paper".
    {{else}}
    The test paper must contain exactly 3 subjects: English, Mathematics, and General Knowledge.
    Generate exactly 10 multiple-choice questions for each subject.
    For Hindi, subject names should be "अंग्रेजी", "गणित", and "सामान्य ज्ञान".
    The title should reflect a full model paper, e.g., "Class 6 Model Test Paper".
    {{/if}}

    For each question:
    - Provide the main question text.
    - Provide exactly 4 multiple-choice options.
    - Indicate the 0-based index of the correct answer.
    - Optionally, provide a brief explanation for the correct answer (this explanation must also be in the {{language}}).

    The difficulty level of the questions should be appropriate for a student in {{{studentClass}}} preparing for defence academy entrance (like Sainik School).
    For Reasoning, include topics like series completion, coding-decoding, analogies, and non-verbal reasoning.
    
    Ensure your output strictly follows the JSON schema provided for TestPaper, TestSubject, and TestQuestion.
  `,
});

const generateTestPaperFlow = ai.defineFlow(
  {
    name: 'generateTestPaperFlow',
    inputSchema: GenerateTestPaperInputSchema,
    outputSchema: TestPaperSchema,
  },
  async (input) => {
    console.log('generateTestPaperFlow: Invoked with input:', JSON.stringify(input));
    try {
      const {output} = await prompt(input);
      
      if (!output || !output.title || !Array.isArray(output.subjects) || output.subjects.length === 0 || 
          output.subjects.some(s => typeof s !== 'object' || s === null || !s.subjectName || !Array.isArray(s.questions) || s.questions.length === 0)) {
        
        console.warn('generateTestPaperFlow: AI returned invalid or incomplete data. Input was:', JSON.stringify(input));
        
        const errorMsg = input.language === 'hi' 
          ? 'क्षमा करें, AI मॉडल पेपर बनाने में असमर्थ था या अपूर्ण डेटा लौटाया। कृपया पुनः प्रयास करें।' 
          : 'Sorry, the AI was unable to generate the model paper or returned incomplete data. Please try again.';
        
        const dummyQuestion: TestQuestion = { questionText: errorMsg, options: ['N/A', 'N/A', 'N/A', 'N/A'], correctAnswerIndex: 0, explanation: errorMsg };
        return {
            title: input.language === 'hi' ? 'त्रुटि: मॉडल पेपर उत्पन्न नहीं हो सका' : 'Error: Could Not Generate Model Paper',
            subjects: [
                { subjectName: input.subjectName || (input.language === 'hi' ? 'त्रुटि विषय' : 'Error Subject'), questions: Array(10).fill(dummyQuestion) },
            ]
        };
      }
      console.log('generateTestPaperFlow: Successfully generated test paper titled:', output.title);
      return output;
    } catch (error: any) {
        console.error('generateTestPaperFlow: Error during generation:', error);
        const genericErrorMsg = input.language === 'hi' ? 'मॉडल पेपर बनाते समय एक अप्रत्याशित त्रुटि हुई।' : 'An unexpected error occurred while generating the model paper.';
        const errorDetail = error.message ? String(error.message).substring(0, 100) : (input.language === 'hi' ? 'अज्ञात त्रुटि' : 'Unknown error');
        
        const dummyErrorQuestion: TestQuestion = {
          questionText: genericErrorMsg,
          options: ['N/A', 'N/A', 'N/A', 'N/A'],
          correctAnswerIndex: 0,
          explanation: errorDetail,
        };
        return {
            title: input.language === 'hi' ? 'त्रुटि: मॉडल पेपर उत्पन्न नहीं हो सका' : 'Error: Could Not Generate Model Paper',
            subjects: [
                { subjectName: input.subjectName || (input.language === 'hi' ? 'त्रुटि विषय' : 'Error Subject'), questions: Array(10).fill(dummyErrorQuestion) },
            ]
        };
    }
  }
);
