"use server";

import { z } from "zod";
import { calculateConfidenceScore } from "@/ai/flows/calculate-confidence-score";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";
import { summarizeVerifiedInfo } from "@/ai/flows/summarize-verified-info";
import type { Claim } from "@/lib/types";

const claimSchema = z.object({
  id: z.string(),
  content: z.string(),
  sourceUrls: z.array(z.string()),
  detectionTimestamp: z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
  lastUpdatedTimestamp: z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
  status: z.enum(["Verified", "False", "Inconclusive", "Trending"]),
  confidenceScore: z.number(),
  language: z.string(),
  upvotes: z.number().optional(),
  downvotes: z.number().optional(),
});


export async function getExplanation(claim: Claim) {
  const verificationResult = `The claim is considered '${claim.status}' with a confidence of ${claim.confidenceScore}%. It has received ${claim.upvotes} positive community votes and ${claim.downvotes} negative votes.`;

  const summary = await summarizeVerifiedInfo({
    claim: claim.content,
    verificationResult: verificationResult,
    confidenceScore: claim.confidenceScore,
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
