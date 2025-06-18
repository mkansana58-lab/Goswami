
'use server';
/**
 * @fileOverview Generates engaging notification messages for various app activities using AI.
 *
 * - generateNotificationMessage - A function that handles the notification message generation.
 * - GenerateNotificationInput - The input type for the function.
 * - GenerateNotificationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotificationInputSchema = z.object({
  activityType: z.enum([
    'new_live_class',
    'new_schedule_item',
    'new_homework_assignment',
    'new_academy_update'
  ]).describe('The type of activity for which the notification is being generated.'),
  language: z.enum(['en', 'hi']).default('en').describe('The language for the notification message (English or Hindi).'),
  itemName: z.string().describe('The primary name or title of the item related to the activity (e.g., class title, homework subject, update title).'),
  itemDetails: z.string().optional().describe('Optional additional details about the item (e.g., class subject and time, homework task description, update summary snippet).')
});
export type GenerateNotificationInput = z.infer<typeof GenerateNotificationInputSchema>;

const GenerateNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('A concise and engaging notification message crafted by the AI, suitable for display to users.')
});
export type GenerateNotificationOutput = z.infer<typeof GenerateNotificationOutputSchema>;

export async function generateNotificationMessage(input: GenerateNotificationInput): Promise<GenerateNotificationOutput> {
  // Fallback in case AI fails
  try {
    const result = await generateNotificationFlow(input);
    if (!result || !result.notificationMessage) {
      throw new Error("AI did not return a message.");
    }
    return result;
  } catch (error) {
    console.error("Error in generateNotificationMessage flow, using fallback:", error);
    let fallbackMessage = `New ${input.activityType.replace(/_/g, ' ')}: ${input.itemName}`;
    if (input.language === 'hi') {
        // Basic fallback translations
        const activityTranslations: Record<string, string> = {
            'new_live_class': 'नई लाइव क्लास',
            'new_schedule_item': 'नया शेड्यूल आइटम',
            'new_homework_assignment': 'नया होमवर्क',
            'new_academy_update': 'नया अपडेट'
        };
        fallbackMessage = `${activityTranslations[input.activityType] || 'नई गतिविधि'}: ${input.itemName}`;
    }
    return { notificationMessage: fallbackMessage };
  }
}

const prompt = ai.definePrompt({
  name: 'generateNotificationMessagePrompt',
  input: {schema: GenerateNotificationInputSchema},
  output: {schema: GenerateNotificationOutputSchema},
  prompt: `
    You are a helpful assistant for a defence academy app. Your task is to generate a concise, engaging, and informative notification message for students about a new activity.
    The message MUST be in the {{language}} language. For Hindi responses, use Devanagari script.
    Keep the message under 150 characters if possible.

    Activity Type: {{activityType}}
    Item Name: {{{itemName}}}
    {{#if itemDetails}}Item Details: {{{itemDetails}}}{{/if}}

    Based on the activity type and item details, craft a suitable notification message.
    Examples of good notification messages:
    - For 'new_live_class' (English): "📢 New Live Class! '[Item Name]' on [Item Details] is scheduled. Don't miss out!"
    - For 'new_live_class' (Hindi): "📢 नई लाइव क्लास! '[Item Name]' ([Item Details]) निर्धारित है। जरूर जुड़ें!"
    - For 'new_homework_assignment' (English): "📚 Homework Alert! '[Item Name]' assignment: '[Item Details]' is due soon. Check it out!"
    - For 'new_homework_assignment' (Hindi): "📚 होमवर्क अलर्ट! '[Item Name]' असाइनमेंट: '[Item Details]' जल्द ही जमा करना है। इसे देखें!"
    - For 'new_schedule_item' (English): "🗓️ Schedule Update! '[Item Name]' has been added to the schedule. Details: [Item Details]."
    - For 'new_schedule_item' (Hindi): "🗓️ शेड्यूल अपडेट! '[Item Name]' को शेड्यूल में जोड़ा गया है। विवरण: [Item Details]।"
    - For 'new_academy_update' (English): "🔔 Important Update! '[Item Name]'. [Item Details Optional - e.g., 'Tap to see details.']"
    - For 'new_academy_update' (Hindi): "🔔 महत्वपूर्ण अपडेट! '[Item Name]'। [Item Details Optional - e.g., 'विवरण देखने के लिए टैप करें।']"

    Generate only the notificationMessage.
  `,
});

const generateNotificationFlow = ai.defineFlow(
  {
    name: 'generateNotificationFlow',
    inputSchema: GenerateNotificationInputSchema,
    outputSchema: GenerateNotificationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.notificationMessage) {
      // This check is important; if AI fails to follow schema, it might be null
      throw new Error("AI failed to generate a notification message according to the schema.");
    }
    return output;
  }
);
