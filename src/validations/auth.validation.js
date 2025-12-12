import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string().min(2).max(255).trim(),
    email: z.email().max(255).toLowerCase().trim(),
    password: z.string().min(6).max(128),
    role: z.enum(['user', 'admin']).default('user')
});

export const signInSchema = z.object({
    email: z.email().toLowerCase().trim(),
    password: z.string().min(1)
});

export const userIdSchema = z.object({
  id: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const n = Number(val);
      return Number.isFinite(n) ? n : val;
    }
    return val;
  }, z.number().int().positive()),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()).optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum(["user", "admin"]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

