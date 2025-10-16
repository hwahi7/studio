'use server';

/**
 * @fileOverview Verification Agent flow that cross-references claims against credible sources.
 *
 * - crossReferenceClaims - A function that handles the cross-referencing process.
 * - CrossReferenceClaimsInput - The input type for the crossReferenceClaims function.
 * - CrossReferenceClaimsOutput - The return type for the crossReferenceClaims function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleSearchRetriever } from '@genkit-ai/google-search';

const CrossReferenceClaimsInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
});
export type CrossReferenceClaimsInput = z.infer<typeof CrossReferenceClaimsInputSchema>;

const CrossReferenceClaimsOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the claim is verified by credible sources.'),
  confidenceScore: z.number().describe('Confidence score (0-1) indicating the reliability of the verification.'),
  explanation: z.string().describe('Explanation of the verification result, citing sources found.'),
});
export type CrossReferenceClaimsOutput = z.infer<typeof CrossReferenceClaimsOutputSchema>;

export async function crossReferenceClaims(input: CrossReferenceClaimsInput): Promise<CrossReferenceClaimsOutput> {
  return crossReferenceClaimsFlow(input);
}

const searchTool = ai.defineTool(
  {
    name: 'search',
    description: 'Search the web for information.',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    const searchResults = await googleSearchRetriever({
      q: input,
      num: 3,
    });
    return JSON.stringify(searchResults);
  }
);


const crossReferenceClaimsFlow = ai.defineFlow(
  {
    name: 'crossReferenceClaimsFlow',
    inputSchema: CrossReferenceClaimsInputSchema,
    outputSchema: CrossReferenceClaimsOutputSchema,
  },
  async (input) => {
    // Since the search tool is removed, we return a default response.
    return {
        isVerified: false,
        confidenceScore: 0,
        explanation: "The search tool is currently unavailable. Unable to cross-reference claim."
    }
  }
);
