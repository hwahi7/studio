'use server';

/**
 * @fileOverview Summarizes verified information about a claim in multiple languages using the Explainer Agent.
 *
 * - summarizeVerifiedInfo - A function that handles the summarization of verified information.
 * - SummarizeVerifiedInfoInput - The input type for the summarizeVerifiedInfo function.
 * - SummarizeVerifiedInfoOutput - The return type for the summarizeVerifiedInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVerifiedInfoInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
  verificationResult: z.string().describe('The verification result of the claim.'),
  confidenceScore: z.number().describe('The confidence score of the verification.'),
  languages: z.array(z.string()).describe('The languages in which the summary should be generated.'),
});
export type SummarizeVerifiedInfoInput = z.infer<typeof SummarizeVerifiedInfoInputSchema>;

const SummarizeVerifiedInfoOutputSchema = z.record(z.string(), z.string()).describe('A map of language codes to summaries.');
export type SummarizeVerifiedInfoOutput = z.infer<typeof SummarizeVerifiedInfoOutputSchema>;

export async function summarizeVerifiedInfo(input: SummarizeVerifiedInfoInput): Promise<SummarizeVerifiedInfoOutput> {
  return summarizeVerifiedInfoFlow(input);
}

const summarizeVerifiedInfoPrompt = ai.definePrompt({
  name: 'summarizeVerifiedInfoPrompt',
  input: {schema: SummarizeVerifiedInfoInputSchema},
  output: {schema: SummarizeVerifiedInfoOutputSchema},
  prompt: `You are an Explainer Agent that summarizes verified information about a claim in multiple languages.

  Claim: {{{claim}}}
  Verification Result: {{{verificationResult}}}
  Confidence Score: {{{confidenceScore}}}

  Generate a summary of the verified information in the following languages:
  {{#each languages}}
  - {{this}}
  {{/each}}

  Return a JSON object where the keys are the language codes and the values are the summaries in the corresponding languages.
  For example:
  {
    "en": "Summary in English",
    "es": "Summary in Spanish",
    "fr": "Summary in French"
  }
`,
});

const summarizeVerifiedInfoFlow = ai.defineFlow(
  {
    name: 'summarizeVerifiedInfoFlow',
    inputSchema: SummarizeVerifiedInfoInputSchema,
    outputSchema: SummarizeVerifiedInfoOutputSchema,
  },
  async input => {
    const {output} = await summarizeVerifiedInfoPrompt(input);
    return output!;
  }
);
