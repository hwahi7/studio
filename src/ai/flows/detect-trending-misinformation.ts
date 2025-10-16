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
    .describe('The content of the web page to analyze for misinformation.'),
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
      'The confidence score that the web page content contains misinformation (0-1).' /* This is out of 1 */
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

const detectTrendingMisinformationPrompt = ai.definePrompt({
  name: 'detectTrendingMisinformationPrompt',
  input: {schema: DetectTrendingMisinformationInputSchema},
  output: {schema: DetectTrendingMisinformationOutputSchema},
  prompt: `You are the Scout Agent, tasked with detecting potential misinformation on web pages.

  Analyze the following web page content and determine if it contains misinformation.

  Web Page Content: {{{webPageContent}}}

  Respond with whether the content is misinformation, your confidence score (0-1), and the reason for your determination.
  Consider trending topics and common misinformation patterns.

  Output should be structured JSON. Do not include any text outside of the JSON block.
  `,
});

const detectTrendingMisinformationFlow = ai.defineFlow(
  {
    name: 'detectTrendingMisinformationFlow',
    inputSchema: DetectTrendingMisinformationInputSchema,
    outputSchema: DetectTrendingMisinformationOutputSchema,
  },
  async input => {
    const {output} = await detectTrendingMisinformationPrompt(input);
    return output!;
  }
);
