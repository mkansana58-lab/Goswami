
'use server';
/**
 * @fileOverview Generates a quiz with multiple-choice questions using an AI model.
 *
 * - generateQuiz - A function that handles quiz generation.
 * - GenerateQuizInput - The input type for the function.
 * - GenerateQuizOutput - The return type for the function.
 * - QuizQuestion - The type for an individual quiz question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Made internal (removed export)
const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly four string options for the question.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
  explanation: z.string().optional().describe('A brief explanation for why the answer is correct, or context for the question. This is optional but highly recommended.')
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Made internal (removed export)
const GenerateQuizInputSchema = z.object({
  classLevel: z.string().describe('The class level for which the quiz should be generated (e.g., "Class 6", "Class 10").'),
  subject: z.string().default('General Knowledge').describe('The subject of the quiz (e.g., "Mathematics", "Science", "General Knowledge").'),
  numQuestions: z.number().positive().max(10).min(3).default(5).describe('Number of questions to generate for the quiz (between 3 and 10).'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the quiz (English or Hindi).')
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Made internal (removed export)
const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the generated quiz, incorporating class level and subject.'),
  questions: z.array(QuizQuestionSchema).describe('A list of generated quiz questions.')
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `
    You are an expert quiz creator for students in India.
    Your task is to generate a quiz with {{{numQuestions}}} multiple-choice questions suitable for {{{classLevel}}} students on the subject of {{{subject}}}.
    The quiz should be in {{language}}. For Hindi responses, use Devanagari script.

    For each question, provide:
    1.  'questionText': The question itself.
    2.  'options': An array of exactly 4 string options.
    3.  'correctAnswerIndex': The 0-based index of the correct option within the 'options' array.
    4.  'explanation': (Optional but highly recommended) A brief explanation for the correct answer or context.

    Ensure the questions are appropriate for the specified class level and cover diverse topics within the subject if it's broad like "General Knowledge".
    The quiz title should be informative, like "{{{classLevel}}} {{{subject}}} Challenge".

    Example of a single question structure (though you will provide an array of these under a 'questions' key, and a 'quizTitle'):
    {
      "questionText": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswerIndex": 2,
      "explanation": "Paris is the capital and most populous city of France."
    }

    Generate a complete quiz object according to the output schema.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input); // output can be null or GenerateQuizOutput

    // Handle cases where the AI fails to generate a valid structure or returns empty/problematic content
    if (!output || !output.questions || output.questions.length === 0 || 
        (output.questions.length === 1 && output.questions[0].options && output.questions[0].options.length === 4 && output.questions[0].options[1] === '-')) {
      const errorMsg = input.language === 'hi' ? 'क्षमा करें, अभी क्विज़ उत्पन्न करना संभव नहीं है।' : 'Sorry, generating the quiz is not possible at the moment.';
      const fallbackTitle = input.language === 'hi' ? `${input.classLevel} ${input.subject} प्रश्नोत्तरी` : `${input.classLevel} ${input.subject} Quiz`;
      return {
        quizTitle: output?.quizTitle || fallbackTitle, // Use output's title if available, else fallback
        questions: [{ // Always return a single error question
            questionText: errorMsg,
            options: [input.language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again', '-', '-', '-'],
            correctAnswerIndex: 0,
            explanation: input.language === 'hi' ? 'कृपया बाद में प्रयास करें।' : 'Please try again later.'
        }]
      };
    }

    // If we reach here, output and output.questions are valid and non-empty
    const questionsWithExplanation = output.questions.map(q => ({
        ...q,
        explanation: q.explanation || (input.language === 'hi' ? 'कोई स्पष्टीकरण उपलब्ध नहीं है।' : 'No explanation available.')
    }));

    return {...output, questions: questionsWithExplanation };
  }
);

    