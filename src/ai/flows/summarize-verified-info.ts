
'use server';

/**
 * @fileOverview Summarizes verified information about a claim in a specific language using the Explainer Agent.
 *
 * - summarizeVerifiedInfo - A function that handles the summarization of verified information.
 * - SummarizeVerifiedInfoInput - The input type for the summarizeVerifiedInfo function.
 * - SummarizeVerifiedInfoOutput - The return type for the summarizeVerifiedInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeVerifiedInfoInputSchema = z.object({
  claim: z.string().describe('The claim to be verified.'),
  verificationResult: z.string().describe('The verification result (e.g., "False", "Verified", "Inconclusive").'),
  confidenceScore: z.number().describe('The confidence score of the verification.'),
  language: z.string().describe('The language in which the summary should be generated (e.g., "English", "Español").'),
  communityFeedback: z.string().describe('A summary of community feedback (votes).')
});
export type SummarizeVerifiedInfoInput = z.infer<typeof SummarizeVerifiedInfoInputSchema>;

const SummarizeVerifiedInfoOutputSchema = z.string().describe('The generated summary in the requested language.');
export type SummarizeVerifiedInfoOutput = z.infer<typeof SummarizeVerifiedInfoOutputSchema>;

export async function summarizeVerifiedInfo(input: SummarizeVerifiedInfoInput): Promise<SummarizeVerifiedInfoOutput> {
  return summarizeVerifiedInfoFlow(input);
}

const summarizeVerifiedInfoPrompt = ai.definePrompt({
  name: 'summarizeVerifiedInfoPrompt',
  input: {schema: SummarizeVerifiedInfoInputSchema},
  prompt: `You are an Explainer Agent. Your task is to provide a clear, neutral, and easy-to-understand explanation for why a claim has been classified in a certain way.

  Analyze the following information:
  - The Claim: "{{{claim}}}"
  - AI Verification Status: "{{{verificationResult}}}"
  - AI Confidence Score: {{{confidenceScore}}}
  - Community Feedback: "{{{communityFeedback}}}"

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
    try {
      const {output} = await summarizeVerifiedInfoPrompt(input);
      
      if (!output) {
        return "An explanation could not be generated at this time.";
      }
      
      return output;
    } catch (error) {
      console.error("Error in summarizeVerifiedInfoFlow:", error);
      // Return a user-friendly error message if the API call fails
      return "An explanation could not be generated due to a temporary issue. Please try again later.";
    }
  }
);
