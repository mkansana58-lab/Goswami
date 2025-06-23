
'use server';
/**
 * @fileOverview Generates a list of current affairs items using an AI model.
 *
 * - generateCurrentAffairs - A function that handles the current affairs generation.
 * - GenerateCurrentAffairsInput - The input type for the function.
 * - GenerateCurrentAffairsOutput - The return type for the function.
 * - CurrentAffairsItem - The type for an individual current affairs item.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCurrentAffairsInputSchema = z.object({
  count: z.number().positive().optional().default(25).describe('Number of current affairs items to generate.'),
  language: z.enum(['en', 'hi']).default('en').describe('Language for the current affairs (English or Hindi).')
});
export type GenerateCurrentAffairsInput = z.infer<typeof GenerateCurrentAffairsInputSchema>;

const CurrentAffairsItemSchema = z.object({
  title: z.string().describe('The headline or title of the current affairs item. Make it concise and informative.'),
  summary: z.string().describe('A brief summary of the current affairs item (2-3 sentences). Ensure it is relevant for competitive exam aspirants.'),
  category: z.string().optional().describe('A category for the item, e.g., National, International, Sports, Science, Economy, Defence. Choose the most relevant one.'),
  sourceName: z.string().optional().describe('A plausible source name if applicable (e.g., Press Information Bureau, The Hindu, World Health Organization). This should be generated based on common knowledge of reputable sources for such news, not actual web browsing. If unsure, omit this field.'),
  publishedAtSuggestion: z.string().describe('A suggested publication date in YYYY-MM-DD format. AI should generate events from the last 6 months relative to its knowledge cut-off date.')
});
export type CurrentAffairsItem = z.infer<typeof CurrentAffairsItemSchema>;

const GenerateCurrentAffairsOutputSchema = z.object({
  articles: z.array(CurrentAffairsItemSchema).describe('A list of generated current affairs articles.')
});
export type GenerateCurrentAffairsOutput = z.infer<typeof GenerateCurrentAffairsOutputSchema>;

export async function generateCurrentAffairs(input: GenerateCurrentAffairsInput): Promise<GenerateCurrentAffairsOutput> {
  return generateCurrentAffairsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCurrentAffairsPrompt',
  input: {schema: GenerateCurrentAffairsInputSchema},
  output: {schema: GenerateCurrentAffairsOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  },
  prompt: `
    You are an expert news editor and current affairs curator specializing in content for competitive exam aspirants (like NDA, CDS, Sainik School Entrance).
    Your task is to generate a list of {{{count}}} relevant current affairs items.
    The items should cover a mix of categories such as National, International, Sports, Science & Technology, Economy, and Defence.
    Ensure the information is presented clearly and concisely.
    For each item, provide a title, a summary, an optional category, an optional plausible source name (do not invent obscure sources), and a suggested publication date (YYYY-MM-DD format).
    
    ALL content (titles, summaries, categories, source names) MUST be in the {{language}} language.
    If the language is 'hi' (Hindi), ALL text MUST be in Devanagari script.

    IMPORTANT: Generate events from the last 6 months based on your latest training data. Do not generate events from the future (e.g., 2045 or 2065). Stick to recent, factual history. If you cannot find a sufficient number of distinct events, it is better to return fewer high-quality items than to invent or repeat information.

    Focus on events that are significant and likely to be asked in competitive exams.
    Do not browse the web. Generate content based on your existing knowledge up to your last training data.
  `,
});

const generateCurrentAffairsFlow = ai.defineFlow(
  {
    name: 'generateCurrentAffairsFlow',
    inputSchema: GenerateCurrentAffairsInputSchema,
    outputSchema: GenerateCurrentAffairsOutputSchema,
  },
  async (input) => {
    console.log('generateCurrentAffairsFlow: Invoked with input language:', input.language, 'and count:', input.count);
    const {output} = await prompt(input);
    if (!output || !output.articles || output.articles.length === 0) {
      const errorMsg = input.language === 'hi' ? 'क्षमा करें, AI इस समय करेंट अफेयर्स उत्पन्न नहीं कर सका।' : 'Sorry, the AI could not generate current affairs at this time.';
      console.warn('generateCurrentAffairsFlow: AI returned no articles or invalid output. Using fallback.');
      return {
        articles: [{
            title: errorMsg,
            summary: input.language === 'hi' ? 'यह एक अस्थायी समस्या हो सकती है। कृपया कुछ देर बाद पुनः प्रयास करें।' : 'This might be a temporary issue. Please try again in a few moments.',
            publishedAtSuggestion: new Date().toISOString().split('T')[0]
        }]
      };
    }
    console.log('generateCurrentAffairsFlow: Successfully generated', output.articles.length, 'articles.');
    return output;
  }
);
