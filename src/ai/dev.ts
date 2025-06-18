
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-difficulty-level.ts';
import '@/ai/flows/predict-selection-chance.ts';
import '@/ai/flows/generate-current-affairs-flow.ts';
import '@/ai/flows/generate-test-paper-flow.ts';
import '@/ai/flows/generate-notification-flow.ts'; // Added new notification flow

