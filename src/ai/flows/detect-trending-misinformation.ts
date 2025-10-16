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

STEP 1: Analyze the user's claim to determine if it is a verifiable factual statement or a subjective opinion.
- A factual claim is objective and can be proven true or false (e.g., "The sky is blue," "Cristiano Ronaldo has scored over 800 goals").
- A subjective claim is an opinion, belief, or personal preference (e.g., "Messi is the GOAT," "That movie was boring").

STEP 2: Based on your analysis in Step 1, proceed as follows:

IF THE CLAIM IS SUBJECTIVE:
- Set 'isMisinformation' to 'false'.
- Set 'confidenceScore' to a low value (e.g., 0.1).
- For the 'reason', explain that the statement is a subjective opinion and therefore cannot be classified as misinformation because it cannot be factually verified.

IF THE CLAIM IS FACTUAL:
- Proceed with fact-checking using the provided context.
${searchContext.length > 0 ? 
`CRITICAL INSTRUCTION: You MUST use the provided real-time Google Search Results to determine if the claim is factual. You are FORBIDDEN from using your internal knowledge for any facts, figures, or dates.
You MUST base your entire analysis on the 'Search Results Context' provided below.

Search Results Context:
${JSON.stringify(searchContext, null, 2)}` 
: 
`CRITICAL INSTRUCTION: Your primary search failed. You MUST now use your own internal knowledge and search capabilities to find the most accurate, up-to-date information to verify the user's claim.
You are FORBIDDEN from stating that you have no information. Find the information and provide a detailed explanation for your reasoning.`
}
`;

    const {output} = await ai.generate({
      system: systemPrompt,
      prompt: `Please analyze the following text based on the instructions: "${webPageContent}"`,
      output: {
        schema: DetectTrendingMisinformationOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
