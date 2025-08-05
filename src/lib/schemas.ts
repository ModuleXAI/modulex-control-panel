import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  username: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const checkUniqueSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
});

export const toolConfigSchema = z.object({
  toolId: z.string().min(1, 'Tool ID is required'),
  config: z.record(z.any()),
});

export const environmentVariableSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  required: z.boolean(),
  type: z.enum(['string', 'number', 'boolean', 'url', 'secret']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CheckUniqueFormData = z.infer<typeof checkUniqueSchema>;
export type ToolConfigFormData = z.infer<typeof toolConfigSchema>;
export type EnvironmentVariableFormData = z.infer<typeof environmentVariableSchema>; 