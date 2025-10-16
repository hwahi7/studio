"use server";

import { z } from "zod";
import { calculateConfidenceScore } from "@/ai/flows/calculate-confidence-score";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";
import { summarizeVerifiedInfo } from "@/ai/flows/summarize-verified-info";
import type { Claim } from "@/lib/types";

export async function getExplanation(claim: Claim) {
  // Simulate fetching verification result based on claim status
  const verificationResult = `The claim is considered '${claim.status}' with a confidence of ${claim.confidence}%. It has received ${claim.upvotes} positive community votes and ${claim.downvotes} negative votes. Evidence suggests: ${claim.refutingEvidence.join(' ')}${claim.supportingEvidence.join(' ')}`;

  const summary = await summarizeVerifiedInfo({
    claim: claim.claim,
    verificationResult: verificationResult,
    confidenceScore: claim.confidence / 100,
    languages: ["en", "hi", "mr"], // English, Hindi, Marathi
  });

  return summary;
}

const misinformationSchema = z.object({
  text: z.string().min(20, { message: "Please enter at least 20 characters."}),
});

export async function checkTextForMisinformation(prevState: any, formData: FormData) {
  const validatedFields = misinformationSchema.safeParse({
    text: formData.get('text'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.text?.[0] || 'Invalid input.',
    };
  }

  try {
    const result = await detectTrendingMisinformation({
      webPageContent: validatedFields.data.text,
    });
    return {
      message: 'success',
      data: result,
    };
  } catch (error) {
    return {
      message: 'An error occurred while analyzing the text. Please try again.',
    };
  }
}
