"use server";

import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

async function validateAuthForm(formData: FormData) {
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
      return {
          message: 'success',
          data: validatedFields.data
      }
}


export async function signup(prevState: any, formData: FormData) {
    return validateAuthForm(formData);
}

export async function login(prevState: any, formData: FormData) {
    return validateAuthForm(formData);
}
