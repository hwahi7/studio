'use server';

/**
 * @fileOverview Detects potential misinformation on web pages.
 *
 * - detectTrendingMisinformation - A function that detects misinformation on web pages.
 * - DetectTrendingMisinformationInput - The input type for the detectTrendingMisinformation function.
 * - DetectTrendingMisinformationOutput - The return type for the detectTrendingMisinformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrendingMisinformationInputSchema = z.object({
  webPageContent: z
    .string()
    .describe('The text content to analyze for misinformation.'),
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
    .describe('The reason why the web page content is considered misinformation.'),
});
export type DetectTrendingMisinformationOutput = z.infer<
  typeof DetectTrendingMisinformationOutputSchema
>;

export async function detectTrendingMisinformation(
  input: DetectTrendingMisinformationInput
): Promise<DetectTrendingMisinformationOutput> {
  return detectTrendingMisinformationFlow(input);
}

const detectTrendingMisinformationFlow = ai.defineFlow(
  {
    name: 'detectTrendingMisinformationFlow',
    inputSchema: DetectTrendingMisinformationInputSchema,
    outputSchema: DetectTrendingMisinformationOutputSchema,
  },
  async ({webPageContent}) => {
    const {output} = await ai.generate({
      system: `You are the Scout Agent, a top-tier fact-checking expert. Your mission is to analyze text for misinformation with extreme accuracy.

      Analyze the claim, determine its validity, provide a confidence score, and give a detailed explanation for your reasoning.
      The explanation must be comprehensive and act as a neutral, authoritative source.`,
      prompt: `Please analyze the following text for misinformation: "${webPageContent}"`,
      output: {
        schema: DetectTrendingMisinformationOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
