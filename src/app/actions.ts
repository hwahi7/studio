
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { detectTrendingMisinformation } from "@/ai/flows/detect-trending-misinformation";
import type { Claim } from "@/lib/types";
import { translateText as translateTextFlow, type TranslateTextInput } from "@/ai/flows/translate-text";


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
      message: "error_min_chars",
      error: errorText,
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
  } catch (error: any) {
    console.error("Error in checkTextForMisinformation:", error);
    // Provide a more generic error message for API failures.
    const errorMessage = error.message && error.message.includes('503') 
      ? "The model is currently overloaded. Please try again later."
      : error.message || "An unknown error occurred while analyzing the text.";

    return {
      message: 'error_api',
      error: errorMessage,
      text: textToAnalyze,
    };
  }
}

export async function translateText(input: TranslateTextInput) {
    if (!input.text) {
        return { translatedText: '' };
    }
    try {
        const result = await translateTextFlow(input);
        return result;
    } catch (error) {
        console.error("Error in translateText:", error);
        // Return original text in case of an error
        return { translatedText: input.text };
    }
}
