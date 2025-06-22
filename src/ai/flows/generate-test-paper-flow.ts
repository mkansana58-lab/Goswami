
'use server';
/**
 * @fileOverview Generates tailored mock test papers for JNV and Sainik School entrance exams.
 *
 * - generateTestPaper - A function that handles the test paper generation.
 * - GenerateTestPaperInput - The input type for the function.
 * - TestPaper, TestSubject, TestQuestion - The output types for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestQuestionSchema = z.object({
  questionText: z.string().describe('The main text of the question, including any context or data needed.'),
  figureImageUrl: z.string().optional().describe("URL for an image if the question is figure-based (e.g., for JNV Mental Ability). Use https://placehold.co/150x100.png as a placeholder if needed."),
  options: z.array(z.string()).length(4).describe('An array of exactly four multiple-choice options.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct option in the options array.'),
  explanation: z.string().optional().describe('A brief explanation for the correct answer. This must also be in the specified response language.')
});
export type TestQuestion = z.infer<typeof TestQuestionSchema>;

const TestSubjectSchema = z.object({
  subjectName: z.string().describe('The name of the subject.'),
  questions: z.array(TestQuestionSchema).describe('An array of questions for this subject.')
});
export type TestSubject = z.infer<typeof TestSubjectSchema>;

const GenerateTestPaperInputSchema = z.object({
  studentName: z.string().describe("The student's name for personalizing the test paper."),
  testType: z.enum(['sainik_school', 'jnv', 'rms', 'subject_wise']).describe("The type of mock test to generate."),
  studentClass: z.string().describe('The class level of the student (e.g., "Class 6", "Class 9", "NDA"). This determines difficulty.'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the test paper. For JNV Class 9, English questions must remain in English.'),
  subject: z.string().describe('The specific subject for the test (e.g., "Mathematics", "Mental Ability", "English").')
});
export type GenerateTestPaperInput = z.infer<typeof GenerateTestPaperInputSchema>;

const TestPaperSchema = z.object({
  title: z.string().describe('A suitable title for the generated test paper in the specified language.'),
  subjects: z.array(TestSubjectSchema).min(1).describe('An array containing exactly one subject for this test part.')
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
    You are an expert question paper setter for competitive entrance exams in India (Sainik School, RMS, JNV).
    Your task is to generate a SINGLE-SUBJECT test paper part for a student named {{{studentName}}} of {{{studentClass}}}.
    The entire test paper, including title, subject name, questions, options, and explanations MUST be in the '{{language}}' language, unless a specific rule overrides this.
    For Hindi ('hi'), ALL translatable content MUST be in Devanagari script.

    TEST GENERATION RULES:
    
    {{#if (eq testType "jnv")}}
      {{#if (eq studentClass "Class 6")}}
        Title: JNV Mock Test (Class 6) - {{{subject}}}
        {{#if (eq subject "Mental Ability")}}
          Generate 40 multiple-choice questions for Mental Ability. These are figure-based questions. For 'questionText', briefly describe the task (e.g., "Find the figure that completes the pattern."). For 'figureImageUrl', provide a placeholder URL like "https://placehold.co/150x100.png".
        {{else if (eq subject "Arithmetic")}}
          Generate 20 multiple-choice questions for Arithmetic.
        {{else if (eq subject "Language")}}
          Generate 20 multiple-choice questions for Language (Hindi or English based on the main language parameter).
        {{/if}}
      {{else if (eq studentClass "Class 9")}}
        Title: JNV Mock Test (Class 9) - {{{subject}}}
        {{#if (eq subject "English")}}
          Generate 15 multiple-choice questions for English. IMPORTANT: These questions and options MUST be in English, regardless of the main language parameter.
        {{else if (eq subject "Hindi")}}
          Generate 15 multiple-choice questions for Hindi. These questions and options MUST be in Hindi (Devanagari script).
        {{else if (eq subject "Science")}}
          Generate 35 multiple-choice questions for Science.
        {{else if (eq subject "Mathematics")}}
          Generate 35 multiple-choice questions for Mathematics.
        {{/if}}
      {{/if}}
    {{/if}}

    {{#if (eq testType "sainik_school")}}
      {{#if (eq studentClass "Class 6")}}
        Title: Sainik School Mock Test (Class 6) - {{{subject}}}
        {{#if (eq subject "Mathematics")}}
          Generate 50 multiple-choice questions for Mathematics.
        {{else if (or (eq subject "General Knowledge") (eq subject "Language") (eq subject "Intelligence"))}}
          Generate 25 multiple-choice questions for {{{subject}}}. Language questions should match the main '{{language}}' parameter.
        {{/if}}
      {{else if (eq studentClass "Class 9")}}
        Title: Sainik School Mock Test (Class 9) - {{{subject}}}
        {{#if (eq subject "Mathematics")}}
          Generate 50 multiple-choice questions for Mathematics. Questions MUST be in English.
        {{else if (or (eq subject "English") (eq subject "Intelligence") (eq subject "General Science") (eq subject "Social Studies"))}}
          Generate 25 multiple-choice questions for {{{subject}}}. All questions MUST be in English.
        {{/if}}
      {{/if}}
    {{/if}}

    {{#if (eq testType "rms")}}
       Title: RMS Mock Test ({{{studentClass}}}) - {{{subject}}}
        {{#if (eq studentClass "Class 6")}}
             Generate 50 multiple-choice questions for {{{subject}}}.
        {{else if (eq studentClass "Class 9")}}
            {{#if (eq subject "Paper-I English")}}
                Generate 100 questions for English.
            {{else if (eq subject "Paper-II Hindi & Social Science")}}
                Generate 50 questions for Hindi and 50 questions for Social Science.
            {{else if (eq subject "Paper-III Maths & Science")}}
                Generate 50 questions for Mathematics and 50 questions for Science.
            {{/if}}
        {{/if}}
    {{/if}}

    {{#if (eq testType "subject_wise")}}
      Title: Practice Test - {{{subject}}}
      Generate 15 multiple-choice questions for {{{subject}}} suitable for a {{{studentClass}}} student.
    {{/if}}

    For EACH question, you MUST provide:
    1.  questionText: The full text of the question.
    2.  options: An array of EXACTLY four string options.
    3.  correctAnswerIndex: The 0-based index of the correct option.
    4.  explanation: A brief, clear explanation for why the answer is correct, in the specified language.
    5.  figureImageUrl: (Optional) ONLY for JNV Class 6 Mental Ability. Provide a placeholder URL.

    Ensure the difficulty is appropriate for the specified class. Your entire response must be a single JSON object that strictly adheres to the provided output schema.
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
                { subjectName: input.subject || 'Error', questions: Array(10).fill(dummyQuestion) },
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
                { subjectName: input.subject || 'Error', questions: Array(10).fill(dummyErrorQuestion) },
            ]
        };
    }
  }
);
