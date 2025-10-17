'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/calculate-confidence-score.ts';
import '@/ai/flows/summarize-verified-info.ts';
import '@/ai/flows/detect-trending-misinformation.ts';
import '@/ai/flows/cross-reference-claims.ts';
import '@/ai/flows/generate-search-query.ts';
