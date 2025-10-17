"use server";

import { z } from "zod";
import { Timestamp, collection, addDoc, getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase/index";
import { calculateConfidenceScore } from "@/ai/flows/calculate-confidence-score";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";
import { summarizeVerifiedInfo } from "@/ai/flows/summarize-verified-info";
import type { Claim } from "@/lib/types";
import { revalidatePath } from "next/cache";

const claimSchema = z.object({
  id: z.string(),
  content: z.string(),
  sourceUrls: z.array(z.string()),
  detectionTimestamp: z.custom<Timestamp>(),
  lastUpdatedTimestamp: z.custom<Timestamp>(),
  status: z.enum(["Verified", "False", "Inconclusive", "Trending"]),
  confidenceScore: z.number(),
  language: z.string(),
  upvotes: z.number().optional(),
  downvotes: z.number().optional(),
});


export async function getExplanation(claim: Claim, language: string = "en") {
  const verificationResult = `The claim is considered '${claim.status}' with a confidence of ${claim.confidenceScore}%. It has received ${claim.upvotes || 0} positive community votes and ${claim.downvotes || 0} negative votes.`;

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
    
    // Save to Firestore
    try {
        const { firestore } = initializeFirebase();
        const claimsCollection = collection(firestore, "claims");
        const newClaim: Omit<Claim, "id"> = {
            content: textToAnalyze,
            sourceUrls: ['User Input via Extension'],
            detectionTimestamp: Timestamp.now(),
            lastUpdatedTimestamp: Timestamp.now(),
            status: result.isMisinformation ? "False" : "Verified",
            confidenceScore: result.isMisinformation ? result.confidenceScore : 1 - result.confidenceScore,
            language: "en", // Default language for now
            upvotes: 0,
            downvotes: 0,
        };
        await addDoc(claimsCollection, newClaim);
        revalidatePath('/');
    } catch (dbError) {
        console.error("Failed to save claim to Firestore:", dbError);
        // We don't block the user response for this, just log the error
    }


    return {
      message: 'success',
      data: result,
      text: textToAnalyze,
    };
  } catch (error) {
    return {
      message: 'An error occurred while analyzing the text. Please try again.',
      text: textToAnalyze,
    };
  }
}
