'use server';

/**
 * @fileOverview Verification Agent flow that cross-references claims against credible sources using fact-check APIs.
 *
 * - crossReferenceClaims - A function that handles the cross-referencing process.
 * - CrossReferenceClaimsInput - The input type for the crossReferenceClaims function.
 * - CrossReferenceClaimsOutput - The return type for the crossReferenceClaims function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossReferenceClaimsInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
  sources: z.array(z.string()).optional().describe('Optional list of credible sources to check against.'),
});
export type CrossReferenceClaimsInput = z.infer<typeof CrossReferenceClaimsInputSchema>;

const CrossReferenceClaimsOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the claim is verified by credible sources.'),
  confidenceScore: z.number().describe('Confidence score (0-1) indicating the reliability of the verification.'),
  explanation: z.string().describe('Explanation of the verification result.'),
});
export type CrossReferenceClaimsOutput = z.infer<typeof CrossReferenceClaimsOutputSchema>;

export async function crossReferenceClaims(input: CrossReferenceClaimsInput): Promise<CrossReferenceClaimsOutput> {
  return crossReferenceClaimsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossReferenceClaimsPrompt',
  input: {schema: CrossReferenceClaimsInputSchema},
  output: {schema: CrossReferenceClaimsOutputSchema},
  prompt: `You are a verification agent that cross-references claims against credible sources.

  Claim: {{{claim}}}

  {{~#if sources}}
  Credible Sources:
  {{~#each sources}}
  - {{{this}}}
  {{~/each}}
  {{~else}}
  No credible sources provided. Use your best judgement to find credible sources online.
  {{~/if}}

  Based on the claim and the provided credible sources (if any), determine if the claim is verified. Provide a confidence score (0-1) and an explanation for the verification result.

  Output in JSON format:
  {
    "isVerified": boolean,
    "confidenceScore": number,
    "explanation": string
  }
`,
});

const crossReferenceClaimsFlow = ai.defineFlow(
  {
    name: 'crossReferenceClaimsFlow',
    inputSchema: CrossReferenceClaimsInputSchema,
    outputSchema: CrossReferenceClaimsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
