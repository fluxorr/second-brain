import { z } from 'zod'


export const userSchema = z.object({
  username: z.string().min(3).max(10),
  password: z.string()
    .min(8)
    .max(20)
    .refine(val => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine(val => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine(val => /\d/.test(val), {
      message: 'Password must contain at least one number',
    })
    .refine(val => /[@$#!%*?&]/.test(val), {
      message: 'Password must contain at least one special character (@$!%*?&)',
    }),
});

