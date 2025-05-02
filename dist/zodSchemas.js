"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(10),
    password: zod_1.z.string()
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
