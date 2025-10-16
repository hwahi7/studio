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
import { searchGoogle } from '@/services/google-search';
import { generateSearchQuery } from './generate-search-query';

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

    let searchResults = await searchGoogle(webPageContent);

    // If initial search yields no results, generate a better query and retry
    if (searchResults.length === 0) {
        const newQuery = await generateSearchQuery({ text: webPageContent });
        searchResults = await searchGoogle(newQuery.query);
    }
    
    const searchContext = searchResults.map(r => ({ title: r.title, snippet: r.snippet, link: r.link })).slice(0, 5);

    const systemPrompt = 
`You are the Scout Agent, a top-tier fact-checking expert. Your mission is to analyze text for misinformation with extreme accuracy.

${searchContext.length > 0 ? 
`CRITICAL INSTRUCTION: You MUST use the provided real-time Google Search Results to determine if the claim is factual. You are FORBIDDEN from using your internal knowledge for any facts, figures, or dates.
You MUST base your entire analysis on the 'Search Results Context' provided below. Find and use the current date in your reasoning.

Search Results Context:
${JSON.stringify(searchContext, null, 2)}` 
: 
`CRITICAL INSTRUCTION: Your primary search failed. You MUST now use your own internal knowledge and search capabilities to find the most accurate, up-to-date information to verify the user's claim.
You are FORBIDDEN from stating that you have no information. Find the information. Provide a detailed explanation for your reasoning and the current date.`
}
`;

    const {output} = await ai.generate({
      system: systemPrompt,
      prompt: `Based *only* on the provided context (if any), please analyze the following text for misinformation: "${webPageContent}"`,
      output: {
        schema: DetectTrendingMisinformationOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
