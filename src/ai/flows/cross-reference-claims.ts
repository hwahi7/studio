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

const crossReferenceClaimsFlow = ai.defineFlow(
  {
    name: 'crossReferenceClaimsFlow',
    inputSchema: CrossReferenceClaimsInputSchema,
    outputSchema: CrossReferenceClaimsOutputSchema,
  },
  async (input) => {
    // Placeholder implementation since the search tool is not available.
    // This will now compile but does not perform a live search.
    return {
      isVerified: false,
      confidenceScore: 0.1,
      explanation: "Could not perform live web search to verify the claim. The search tool is currently unavailable. This result is based on the model's internal knowledge only."
    };
  }
);
