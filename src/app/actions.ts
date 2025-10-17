
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";
import type { Claim } from "@/lib/types";


const misinformationSchema = z.object({
  text: z.string().min(20, { message: "Please enter at least 20 characters."}),
});

export async function checkTextForMisinformation(prevState: any, formData: FormData) {
  const validatedFields = misinformationSchema.safeParse({
    text: formData.get('text'),
  });

  if (!validatedFields.success) {
    const errorText = validatedFields.error.flatten().fieldErrors.text?.[0];
     return {
      message: errorText === "String must contain at least 20 character(s)" ? "error_min_chars" : "error_invalid_input",
    };
  }

  const textToAnalyze = validatedFields.data.text;

  try {
    const result = await detectTrendingMisinformation({
      webPageContent: textToAnalyze,
    });
    
    revalidatePath('/');

    return {
      message: 'success',
      data: result,
      text: textToAnalyze,
    };
  } catch (error) {
    console.error("Error in checkTextForMisinformation:", error);
    return {
      message: 'error_api',
      text: textToAnalyze,
    };
  }
}
