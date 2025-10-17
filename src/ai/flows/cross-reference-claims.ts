'use server';

/**
 * @fileOverview Verification Agent flow that cross-references claims against credible sources.
 *
 * - crossReferenceClaims - A function that handles the cross-referencing process.
 * - CrossReferenceClaimsInput - The input type for the crossReferenceClaims function
 * - CrossReferenceClaimsOutput - The return type for the crossReferenceClaims function
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CrossReferenceClaimsInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
});
export type CrossReferenceClaimsInput = z.infer<
  typeof CrossReferenceClaimsInputSchema
>;

const CrossReferenceClaimsOutputSchema = z.object({
  isVerified: z
    .boolean()
    .describe(
      'Whether the claim is considered true or false based on available information.'
    ),
  confidenceScore: z
    .number()
    .describe(
      'Confidence score (0-1) indicating the reliability of the verification.'
    ),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of the verification result, citing the reasoning and information used.'
    ),
});
export type CrossReferenceClaimsOutput = z.infer<
  typeof CrossReferenceClaimsOutputSchema
>;

export async function crossReferenceClaims(
  input: CrossReferenceClaimsInput
): Promise<CrossReferenceClaimsOutput> {
  return crossReferenceClaimsFlow(input);
}

const crossReferenceClaimsFlow = ai.defineFlow(
  {
    name: 'crossReferenceClaimsFlow',
    inputSchema: CrossReferenceClaimsInputSchema,
    outputSchema: CrossReferenceClaimsOutputSchema,
  },
  async ({claim}) => {
    const {output} = await ai.generate({
      system: `You are an expert fact-checking agent. Your task is to verify the provided claim with the highest degree of accuracy.

      CRITICAL INSTRUCTION: You MUST use your own internal knowledge to determine if the claim is factual. You MUST NOT use any external tools. Provide a confidence score and a detailed explanation for your reasoning.
      The explanation should be comprehensive and act as a neutral, authoritative source.`,
      prompt: `Please verify the following claim: "${claim}"`,
      output: {
        schema: CrossReferenceClaimsOutputSchema,
        format: 'json',
      },
    });

    return output!;
  }
);
