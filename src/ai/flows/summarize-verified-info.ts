'use server';

/**
 * @fileOverview Summarizes verified information about a claim in a specific language using the Explainer Agent.
 *
 * - summarizeVerifiedInfo - A function that handles the summarization of verified information.
 * - SummarizeVerifiedInfoInput - The input type for the summarizeVerifiedInfo function.
 * - SummarizeVerifiedInfoOutput - The return type for the summarizeVerifiedInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVerifiedInfoInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
  verificationResult: z.string().describe('A sentence describing the verification result and community feedback.'),
  confidenceScore: z.number().describe('The confidence score of the verification.'),
  language: z.string().describe('The language in which the summary should be generated (e.g., "English", "Español").'),
});
export type SummarizeVerifiedInfoInput = z.infer<typeof SummarizeVerifiedInfoInputSchema>;

// The output is now a simple string.
const SummarizeVerifiedInfoOutputSchema = z.string().describe('The generated summary in the requested language.');
export type SummarizeVerifiedInfoOutput = z.infer<typeof SummarizeVerifiedInfoOutputSchema>;

export async function summarizeVerifiedInfo(input: SummarizeVerifiedInfoInput): Promise<SummarizeVerifiedInfoOutput> {
  return summarizeVerifiedInfoFlow(input);
}

const summarizeVerifiedInfoPrompt = ai.definePrompt({
  name: 'summarizeVerifiedInfoPrompt',
  input: {schema: SummarizeVerifiedInfoInputSchema},
  output: {schema: SummarizeVerifiedInfoOutputSchema},
  prompt: `You are an Explainer Agent. Your task is to provide a clear, neutral, and easy-to-understand explanation for why a claim has been classified in a certain way.

  Analyze the following information:
  - The Claim: "{{{claim}}}"
  - Verification & Community Feedback: "{{{verificationResult}}}"
  - AI Confidence Score: {{{confidenceScore}}}

  Based on all of this information, generate a concise summary (2-3 sentences) that explains the outcome. Write the entire summary in the following language: {{{language}}}.
  
  You MUST provide a coherent explanation. Synthesize the provided information into a clear summary. Do not just repeat the inputs.
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
    
    // Add a fallback to prevent schema validation errors if the model returns null/empty
    if (!output) {
      return "An explanation could not be generated at this time.";
    }
    
    return output;
  }
);
