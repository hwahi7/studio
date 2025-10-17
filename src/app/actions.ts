
"use server";

import { z } from "zod";
import { summarizeVerifiedInfo } from "@/ai/flows/summarize-verified-info";
import { revalidatePath } from "next/cache";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";

// This type can be simplified as we don't need the full Claim with Timestamps
type ClaimSummary = {
  content: string;
  status: string;
  confidenceScore: number;
  upvotes?: number;
  downvotes?: number;
}

export async function getExplanation(claim: ClaimSummary, language: string = "en") {
  const verificationResult = `The claim is considered '${claim.status}' with a confidence of ${Math.round(claim.confidenceScore * 100)}%. It has received ${claim.upvotes || 0} positive community votes and ${claim.downvotes || 0} negative votes.`;

  const summary = await summarizeVerifiedInfo({
    claim: claim.content,
    verificationResult: verificationResult,
    confidenceScore: claim.confidenceScore,
    languages: [language],
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

  const textToAnalyze = validatedFields.data.text;

  try {
    const result = await detectTrendingMisinformation({
      webPageContent: textToAnalyze,
    });
    
    // The claim is now saved on the client-side to ensure real-time updates.
    revalidatePath('/');

    return {
      message: 'success',
      data: result,
      text: textToAnalyze,
    };
  } catch (error) {
    console.error("Error in checkTextForMisinformation:", error);
    return {
      message: 'An error occurred while analyzing the text. Please try again.',
      text: textToAnalyze,
    };
  }
}
