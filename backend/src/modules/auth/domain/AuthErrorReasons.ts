// src/modules/auth/domain/AuthErrorReasons.ts
import { AuthError } from "./AuthErrors.js";

/**
 * Zod requires a non-empty tuple for z.enum().
 * Object.values(AuthError) gives string[], so we cast to [string, ...string[]].
 */
export const authErrorReasons = Object.values(AuthError) as [
    (typeof AuthError)[keyof typeof AuthError],
    ...(typeof AuthError)[keyof typeof AuthError][]
];