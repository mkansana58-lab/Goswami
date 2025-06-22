
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
import { testConfigs } from '@/lib/test-configs';

const TestQuestionSchema = z.object({
  questionText: z.string().describe('The main text of the question, including any context or data needed.'),
  figureImageUrl: z.string().optional().describe("URL for an image if the question is figure-based (e.g., for JNV Mental Ability). Use https://placehold.co/150x100.png as a placeholder if needed."),
  options: z.array(z.string()).length(4).describe('An array of exactly four multiple-choice options.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct option in the options array.'),
  explanation: z.string().optional().describe('A brief, clear explanation for the correct answer. This must also be in the specified response language.')
});
export type TestQuestion = z.infer<typeof TestQuestionSchema>;

const TestSubjectSchema = z.object({
  subjectName: z.string().describe('The name of the subject.'),
  questions: z.array(TestQuestionSchema).describe('An array of questions for this subject.')
});
export type TestSubject = z.infer<typeof TestSubjectSchema>;

const TestPaperSchema = z.object({
  title: z.string().describe('A suitable title for the generated test paper in the specified language.'),
  subjects: z.array(TestSubjectSchema).min(1).describe('An array containing exactly one subject for this test part.')
});
export type TestPaper = z.infer<typeof TestPaperSchema>;


const GenerateTestPaperInputSchema = z.object({
  studentName: z.string().describe("The student's name for personalizing the test paper."),
  testType: z.enum(['sainik_school', 'jnv', 'rms', 'subject_wise']).describe("The type of mock test to generate."),
  studentClass: z.string().describe('The class level of the student (e.g., "Class 6", "Class 9", "NDA"). This determines difficulty.'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the test paper. For JNV Class 9, English questions must remain in English.'),
  subject: z.string().describe('The specific subject for the test (e.g., "Mathematics", "Mental Ability", "English").')
});
export type GenerateTestPaperInput = z.infer<typeof GenerateTestPaperInputSchema>;


const PromptInputSchema = GenerateTestPaperInputSchema.extend({
    numberOfQuestions: z.number().describe("The exact number of questions to generate for the test."),
    specialInstructions: z.string().describe("Any special instructions for the test generation, such as language constraints or question types (e.g., figure-based).")
});


export async function generateTestPaper(input: GenerateTestPaperInput): Promise<TestPaper> {
  return generateTestPaperFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateTestPaperPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: TestPaperSchema},
  prompt: `
    You are an expert question paper setter for competitive entrance exams in India (Sainik School, RMS, JNV) and general subjects.
    Your task is to generate a SINGLE-SUBJECT test paper for a student named {{{studentName}}} of {{{studentClass}}}.
    The subject for this test is '{{{subject}}}'.
    The test type is '{{{testType}}}'.

    You MUST generate EXACTLY {{{numberOfQuestions}}} multiple-choice questions for this subject.
    The entire test paper, including title, subject name, questions, options, and explanations MUST be in the '{{language}}' language, unless a special instruction overrides this.
    For Hindi ('hi'), ALL translatable content MUST be in Devanagari script.

    Follow these SPECIAL INSTRUCTIONS very carefully:
    {{{specialInstructions}}}

    The title of the test paper should be appropriate for the test type, class, and subject.

    For EACH of the {{{numberOfQuestions}}} questions, you MUST provide:
    1.  questionText: The full text of the question.
    2.  options: An array of EXACTLY four string options.
    3.  correctAnswerIndex: The 0-based index of the correct option.
    4.  explanation: A brief, clear explanation for why the answer is correct, in the specified language.
    5.  figureImageUrl: (Optional) ONLY if the special instructions mention figure-based questions. Provide a placeholder URL like "https://placehold.co/150x100.png".

    Your entire response must be a single, valid JSON object that strictly adheres to the provided output schema. Do NOT include any other text, markdown, or explanations outside of the JSON structure.
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

    let numberOfQuestions: number;
    let specialInstructions = "No special instructions.";

    // Logic to find the correct configuration for the test
    const testTypeConfig = testConfigs[input.testType];
    const classConfig = testTypeConfig?.[input.studentClass] || testTypeConfig?.['All'];
    const subjectConfig = classConfig?.find(s => s.key === input.subject);

    if (!subjectConfig) {
      console.error(`Could not find config for testType: ${input.testType}, class: ${input.studentClass}, subject: ${input.subject}. This might happen for 'subject_wise' if the subject isn't in the 'All' category.`);
      // Generic fallback for any unconfigured test, like a custom subject in 'subject_wise'
      numberOfQuestions = 25; 
      specialInstructions = `Generate 25 general questions for ${input.subject} suitable for a ${input.studentClass} student.`
    } else {
        numberOfQuestions = subjectConfig.questions;

        // Overriding instructions based on specific test cases
        if (input.testType === 'jnv' && input.studentClass === 'Class 6' && input.subject === 'Mental Ability') {
            specialInstructions = "These are figure-based questions. For 'questionText', briefly describe the task (e.g., 'Find the figure that completes the pattern.'). For 'figureImageUrl', you MUST provide a placeholder URL like 'https://placehold.co/150x100.png'.";
        } else if (input.testType === 'jnv' && input.studentClass === 'Class 9' && input.subject === 'English') {
            specialInstructions = "IMPORTANT: The questions, options, and explanations for this English test MUST be in English, regardless of the main language parameter.";
        } else if (input.testType === 'jnv' && input.studentClass === 'Class 9' && input.subject === 'Hindi') {
            specialInstructions = "IMPORTANT: The questions, options, and explanations for this Hindi test MUST be in Hindi (Devanagari script).";
        } else if (input.testType === 'sainik_school' && input.studentClass === 'Class 9') {
            specialInstructions = "IMPORTANT: ALL questions, options, and explanations for this test MUST be in English.";
        } else if (input.testType === 'sainik_school' && input.studentClass === 'Class 6' && input.subject === 'Language') {
            specialInstructions = `The language for this test should be determined by the main 'language' parameter ('${input.language}'). If it is 'hi', use Hindi. If 'en', use English.`;
        }
    }

    const promptInput = {
        ...input,
        numberOfQuestions,
        specialInstructions
    };

    try {
      const {output} = await prompt(promptInput);
      
      if (!output) {
        console.warn('generateTestPaperFlow: AI returned null or invalid data that failed schema validation. Input was:', JSON.stringify(promptInput));
        throw new Error(input.language === 'hi' ? 'AI मॉडल मान्य टेस्ट पेपर बनाने में विफल रहा।' : 'AI model failed to generate a valid test paper.');
      }
      
      const generatedCount = output.subjects[0]?.questions?.length || 0;
      if (generatedCount < numberOfQuestions) { 
          console.warn(`generateTestPaperFlow: AI generated ${generatedCount} questions, but ${numberOfQuestions} were requested.`);
          throw new Error(input.language === 'hi' ? `AI मॉडल ने इस विषय के लिए केवल ${generatedCount} प्रश्न बनाए, जबकि ${numberOfQuestions} का अनुरोध किया गया था।` : `AI model only generated ${generatedCount} questions for this subject, but ${numberOfQuestions} were requested.`);
      }

      console.log('generateTestPaperFlow: Successfully generated test paper titled:', output.title);
      return output;
    } catch (error: any) {
        console.error('generateTestPaperFlow: Error during generation:', error);
        const specificErrorMsg = error.message.includes('AI model') ? error.message : 
                                 (input.language === 'hi' ? 'मॉडल पेपर बनाते समय एक अप्रत्याशित त्रुटि हुई।' : 'An unexpected error occurred while generating the model paper.');
        
        // Creating a more informative dummy question
        const dummyErrorQuestion: TestQuestion = {
          questionText: specificErrorMsg,
          options: [
              input.language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again', 
              input.language === 'hi' ? 'अलग विषय चुनें' : 'Choose a different subject', 
              input.language === 'hi' ? 'नेटवर्क जांचें' : 'Check network', 
              input.language === 'hi' ? 'व्यवस्थापक से संपर्क करें' : 'Contact admin'
          ],
          correctAnswerIndex: 0,
          explanation: error.message || (input.language === 'hi' ? 'अज्ञात त्रुटि। कंसोल में विवरण देखें।' : 'Unknown error. Check console for details.'),
        };

        return {
            title: input.language === 'hi' ? 'त्रुटि: मॉडल पेपर उत्पन्न नहीं हो सका' : 'Error: Could Not Generate Model Paper',
            subjects: [
                { subjectName: input.subject || 'Error', questions: [dummyErrorQuestion] },
            ]
        };
    }
  }
);
