
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
import { searchGoogle } from '@/services/google-search';

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

const factCheckSearch = ai.defineTool(
    {
      name: 'factCheckSearch',
      description: 'Performs a web search to find the most relevant and factual information about a claim.',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.string().describe('A summary of search results, including titles, snippets, and sources.'),
    },
    async ({ query }) => {
      const searchResults = await searchGoogle(query);
      if (searchResults.length === 0) {
        return "No information found.";
      }
      return JSON.stringify(searchResults.map(r => ({ title: r.title, snippet: r.snippet, link: r.link })));
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
      system: `You are the Scout Agent, an expert fact-checker. Your primary mission is to analyze text for misinformation with extreme accuracy.

      CRITICAL INSTRUCTION:
      1. First, you MUST use the 'factCheckSearch' tool to search the web for the latest, most relevant information regarding the user's text.
      2. Second, you MUST base your conclusion *entirely* on the search results provided by the tool. Do not use your internal knowledge.
      3. After analyzing the search results, determine if the claim is factual, false, or an opinion.
      4. If the claim is a subjective opinion, classify it as not misinformation and explain why it's an opinion.
      5. Finally, provide your response in the required JSON format.`,
      prompt: `Please analyze the following text based on the instructions: "${webPageContent}"`,
      tools: [factCheckSearch],
      output: {
        schema: DetectTrendingMisinformationOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
