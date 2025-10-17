
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

export async function updateProfile(prevState: any, formData: FormData) {
  const displayName = formData.get('displayName');
  if (typeof displayName !== 'string' || displayName.length < 3) {
    return { message: 'Display name must be at least 3 characters long.' };
  }
  return { message: 'success', data: { displayName } };
}

export async function changePassword(prevState: any, formData: FormData) {
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
        return { message: "Passwords do not match." };
    }

    const validatedFields = authSchema.pick({ password: true }).safeParse({ password });

    if (!validatedFields.success) {
        return { message: validatedFields.error.flatten().fieldErrors.password?.[0] };
    }

    return { message: "success", data: validatedFields.data };
}
