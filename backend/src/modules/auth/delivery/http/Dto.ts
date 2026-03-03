import { z } from "../../../../shared/zod/Zod.js";

/** Request */
export const AuthLoginBody = z.object({
    email: z.string().email().openapi({ example: "2251172560@e.tlu.edu.vn" }),
    password: z.string().min(1).openapi({ example: "Admin123!" }),
});

export const AuthIntrospectBody = z.object({
    token: z.string().min(1).openapi({ example: "eyJhbGciOi..." }),
});

export const AuthChangePasswordBody = z.object({
    oldPassword: z.string().min(6).openapi({ example: "OldPass123!" }),
    newPassword: z.string().min(6).openapi({ example: "NewPass123!" }),
});

/** Response */
export const AuthLoginOkResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        accessToken: z.string().openapi({ example: "eyJhbGciOi..." }),
        role: z.enum(["admin", "student", "teacher"]),
        mustChangePassword: z.boolean(),
    }),
});

export const AuthFailResponse = z.object({
    ok: z.literal(false),
    reason: z.string(),
});

export const AuthIntrospectOkResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        valid: z.boolean(),
    }),
});

export const AuthChangePasswordOkResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        changed: z.literal(true),
    }),
});

export const AuthLogoutOkResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        loggedOut: z.literal(true),
    }),
});