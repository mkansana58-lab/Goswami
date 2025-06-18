
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
  publishedAtSuggestion: z.string().describe('A suggested publication date in YYYY-MM-DD format. AI should aim for recent dates relevant to current events known up to its knowledge cut-off. Prioritize events from December 2024 to July 2025 if known, otherwise focus on the most recent events from the last 1-6 months.')
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
  prompt: `
    You are an expert news editor and current affairs curator specializing in content for competitive exam aspirants (like NDA, CDS, Sainik School Entrance).
    Your task is to generate a list of {{{count}}} recent and relevant current affairs items.
    The items should cover a mix of categories such as National, International, Sports, Science & Technology, Economy, and Defence.
    Ensure the information is presented clearly and concisely.
    For each item, provide a title, a summary, an optional category, an optional plausible source name (do not invent obscure sources), and a suggested publication date (YYYY-MM-DD format).
    Prioritize generating events that would plausibly occur or be reported between December 2024 and July 2025 if your knowledge allows for such informed forecasting or common recurring events. If specific events for this future period are not within your knowledge, please generate the most recent and relevant current affairs items based on your latest training data (e.g., from the last 1-6 months).
    Provide the response in {{language}}. For Hindi responses, use Devanagari script.

    Example of a single article structure (though you will provide an array of these):
    Title: Major Defence Exercise 'Yudh Abhyas' Concludes
    Summary: The joint military exercise 'Yudh Abhyas' between India and the USA concluded today, focusing on interoperability and counter-terrorism operations. The exercise involved advanced drills and strategic planning.
    Category: Defence
    SourceName: Press Information Bureau
    PublishedAtSuggestion: (A recent YYYY-MM-DD date, or a date within Dec 2024 - Jul 2025 if plausible)

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
    console.log('generateCurrentAffairsFlow: Invoked with input language:', input.language, 'and count:', input.count); // Added console log
    const {output} = await prompt(input);
    if (!output || !output.articles || output.articles.length === 0) {
      const errorMsg = input.language === 'hi' ? 'क्षमा करें, अभी करेंट अफेयर्स उत्पन्न करना संभव नहीं है।' : 'Sorry, generating current affairs is not possible at the moment.';
      console.warn('generateCurrentAffairsFlow: AI returned no articles or invalid output. Using fallback.');
      return {
        articles: [{
            title: errorMsg,
            summary: input.language === 'hi' ? 'कृपया बाद में प्रयास करें।' : 'Please try again later.',
            publishedAtSuggestion: new Date().toISOString().split('T')[0]
        }]
      };
    }
    console.log('generateCurrentAffairsFlow: Successfully generated', output.articles.length, 'articles.');
    return output;
  }
);
