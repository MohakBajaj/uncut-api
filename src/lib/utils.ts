import { z } from "zod";

export function validateEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  const passwordSchema = z.string().min(8).max(50);
  return passwordSchema.safeParse(password).success;
}

export function validateUsername(username: string): boolean {
  const usernameSchema = z
    .string()
    .min(5)
    .max(50)
    .regex(/^[a-zA-Z0-9._]+$/);
  return usernameSchema.safeParse(username).success;
}
