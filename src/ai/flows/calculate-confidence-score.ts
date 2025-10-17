'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating a confidence score for a claim based on available evidence.
 *
 * - calculateConfidenceScore - A function that calculates the confidence score for a claim.
 * - CalculateConfidenceScoreInput - The input type for the calculateConfidenceScore function.
 * - CalculateConfidenceScoreOutput - The return type for the calculateConfidenceScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CalculateConfidenceScoreInputSchema = z.object({
  claim: z.string().describe('The claim to be evaluated.'),
  supportingEvidence: z.array(z.string()).describe('Evidence supporting the claim.'),
  refutingEvidence: z.array(z.string()).describe('Evidence refuting the claim.'),
});
export type CalculateConfidenceScoreInput = z.infer<
  typeof CalculateConfidenceScoreInputSchema
>;

const CalculateConfidenceScoreOutputSchema = z.object({
  confidenceScore: z.number().describe('The confidence score for the claim (0-1).'),
  reasoning: z.string().describe('The reasoning behind the confidence score.'),
});
export type CalculateConfidenceScoreOutput = z.infer<
  typeof CalculateConfidenceScoreOutputSchema
>;

export async function calculateConfidenceScore(
  input: CalculateConfidenceScoreInput
): Promise<CalculateConfidenceScoreOutput> {
  return calculateConfidenceScoreFlow(input);
}

const calculateConfidenceScorePrompt = ai.definePrompt({
  name: 'calculateConfidenceScorePrompt',
  input: {schema: CalculateConfidenceScoreInputSchema},
  output: {schema: CalculateConfidenceScoreOutputSchema},
  prompt: `You are an AI agent that assesses the validity of claims based on supporting and refuting evidence.

  Evaluate the following claim:
  Claim: {{{claim}}}

  Supporting Evidence:
  {{#if supportingEvidence}}
    {{#each supportingEvidence}}
      - {{{this}}}
    {{/each}}
  {{else}}
    None
  {{/if}}

  Refuting Evidence:
  {{#if refutingEvidence}}
    {{#each refutingEvidence}}
      - {{{this}}}
    {{/each}}
  {{else}}
    None
  {{/if}}

  Based on the evidence, determine a confidence score (0-1) for the claim and provide a brief reasoning.
  Consider the quality and relevance of the evidence.

  Confidence Score: {{confidenceScore}}
  Reasoning: {{reasoning}}`,
});

const calculateConfidenceScoreFlow = ai.defineFlow(
  {
    name: 'calculateConfidenceScoreFlow',
    inputSchema: CalculateConfidenceScoreInputSchema,
    outputSchema: CalculateConfidenceScoreOutputSchema,
  },
  async input => {
    const {output} = await calculateConfidenceScorePrompt(input);
    return output!;
  }
);
