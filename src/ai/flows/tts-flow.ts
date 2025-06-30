'use server';
/**
 * @fileOverview An AI flow for converting text to speech.
 *
 * - textToSpeech - A function that converts text into a playable audio data URI.
 * - TextToSpeechInput - The input type for the function.
 * - TextToSpeechOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

const TextToSpeechInputSchema = z.string().describe('The text to convert to speech.');
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe('The generated audio as a data URI in WAV format.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    if (!query) {
        throw new Error("Input text cannot be empty.");
    }

    const { media } = await ai.generate({
      // Use the specific TTS model from googleAI plugin
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A standard voice
          },
        },
      },
      prompt: query,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // The media URL from Gemini TTS is Base64 encoded PCM data.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    // Convert PCM to WAV format to be playable in browsers.
    const wavData = await toWav(audioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavData,
    };
  }
);

// Helper function to convert raw PCM audio data to WAV format.
async function toWav(
  pcmData: Buffer,
  channels: number = 1,
  rate: number = 24000,
  sampleWidth: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const buffers: Buffer[] = [];
    writer.on('data', (chunk) => {
      buffers.push(chunk);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(buffers).toString('base64'));
    });
    writer.on('error', (err) => {
      reject(new Error('Failed to convert PCM to WAV: ' + err.message));
    });

    writer.write(pcmData);
    writer.end();
  });
}
