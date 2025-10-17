'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise search query from a given text.
 *
 * - generateSearchQuery - A function that creates a search query.
 * - GenerateSearchQueryInput - The input type for the generateSearchQuery function.
 * - GenerateSearchQueryOutput - The return type for the generateSearchQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateSearchQueryInputSchema = z.object({
  text: z.string().describe('The text to generate a search query from.'),
});
export type GenerateSearchQueryInput = z.infer<
  typeof GenerateSearchQueryInputSchema
>;

const GenerateSearchQueryOutputSchema = z.object({
  query: z.string().describe('The generated search query.'),
});
export type GenerateSearchQueryOutput = z.infer<
  typeof GenerateSearchQueryOutputSchema
>;

export async function generateSearchQuery(
  input: GenerateSearchQueryInput
): Promise<GenerateSearchQueryOutput> {
  return generateSearchQueryFlow(input);
}

const generateSearchQueryPrompt = ai.definePrompt({
  name: 'generateSearchQueryPrompt',
  input: {schema: GenerateSearchQueryInputSchema},
  output: {schema: GenerateSearchQueryOutputSchema},
  prompt: `You are an expert at generating concise and effective search engine queries.
  
  Based on the following text, create a search query that will find the most relevant and factual information.
  
  Text: {{{text}}}
  
  Return only the search query.`,
});

const generateSearchQueryFlow = ai.defineFlow(
  {
    name: 'generateSearchQueryFlow',
    inputSchema: GenerateSearchQueryInputSchema,
    outputSchema: GenerateSearchQueryOutputSchema,
  },
  async input => {
    const {output} = await generateSearchQueryPrompt(input);
    return output!;
  }
);
