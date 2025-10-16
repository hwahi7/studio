"use server";

import { z } from "zod";
import { getAuth } from "firebase/auth";
import { initializeFirebase } from "@/firebase";
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from "@/firebase/non-blocking-login";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      message: "Invalid input.",
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { auth } = initializeFirebase();
  try {
    initiateEmailSignUp(
      auth,
      validatedFields.data.email,
      validatedFields.data.password
    );
    return { message: "success" };
  } catch (error: any) {
    return {
      message: error.message || "An unexpected error occurred.",
    };
  }
}

export async function login(prevState: any, formData: FormData) {
  const validatedFields = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      message: "Invalid input.",
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { auth } = initializeFirebase();
  try {
    initiateEmailSignIn(
      auth,
      validatedFields.data.email,
      validatedFields.data.password
    );
    return { message: "success" };
  } catch (error: any) {
    return {
      message: error.message || "An unexpected error occurred.",
    };
  }
}
