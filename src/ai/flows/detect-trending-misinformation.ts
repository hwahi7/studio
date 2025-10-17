
'use server';

/**
 * @fileOverview Detects potential misinformation on web pages.
 *
 * - detectTrendingMisinformation - A function that detects misinformation on web pages.
 * - DetectTrendingMisinformationInput - The input type for the detectTrendingMisinformation function.
 * - DetectTrendingMisinformationOutput - The return type for the detectTrendingMisinformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {searchGoogle} from '@/services/google-search';

const DetectTrendingMisinformationInputSchema = z.object({
  webPageContent: z
    .string()
    .describe('The text to analyze for misinformation.'),
});
export type DetectTrendingMisinformationInput = z.infer<
  typeof DetectTrendingMisinformationInputSchema
>;

const DetectTrendingMisinformationOutputSchema = z.object({
  isMisinformation: z
    .boolean()
    .describe('Whether or not the web page content contains misinformation.'),
  confidenceScore: z
    .number()
    .describe(
      'The confidence score that the web page content contains misinformation (0-1).'
    ),
  reason: z
    .string()
    .describe(
      'The reason why the web page content is considered misinformation.'
    ),
});
export type DetectTrendingMisinformationOutput = z.infer<
  typeof DetectTrendingMisinformationOutputSchema
>;

export async function detectTrendingMisinformation(
  input: DetectTrendingMisinformationInput
): Promise<DetectTrendingMisinformationOutput> {
  return detectTrendingMisinformationFlow(input);
}

const getCurrentDate = ai.defineTool(
  {
    name: 'getCurrentDate',
    description: 'Returns the current date.',
    outputSchema: z.string(),
  },
  async () => {
    return new Date().toDateString();
  }
);

const factCheckSearch = ai.defineTool(
  {
    name: 'factCheckSearch',
    description: 'Searches for fact-checking information on a given topic.',
    inputSchema: z.string().describe('The search query.'),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string(),
      })
    ),
  },
  async query => {
    return await searchGoogle(query);
  }
);

const detectTrendingMisinformationFlow = ai.defineFlow(
  {
    name: 'detectTrendingMisinformationFlow',
    inputSchema: DetectTrendingMisinformationInputSchema,
    outputSchema: DetectTrendingMisinformationOutputSchema,
  },
  async ({webPageContent}) => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview',
      tools: [factCheckSearch, getCurrentDate],
      system: `You are the Scout Agent, an expert fact-checker. Your mission is to analyze text for misinformation with extreme accuracy.

You have access to two powerful tools:
1. 'getCurrentDate': Use this tool to get the current date for verifying claims about time.
2. 'factCheckSearch': Use this for all other factual claims to find the most accurate, up-to-date information.

CRITICAL INSTRUCTIONS:
- You are FORBIDDEN from using your internal knowledge for any facts, figures, or dates. You MUST use the tools provided.
- First, analyze the user's claim to determine if it is a verifiable factual statement or a subjective opinion.
- If the claim is about the current date, use the 'getCurrentDate' tool.
- For all other factual claims, use the 'factCheckSearch' tool.
- If the claim is a subjective opinion, classify it as not misinformation and explain why it's an opinion.

After your analysis, provide your response in the required JSON format.`,
      prompt: `Please analyze the following text based on the instructions: "${webPageContent}"`,
      output: {
        schema: DetectTrendingMisinformationOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
