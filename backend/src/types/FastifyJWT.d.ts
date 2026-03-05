// src/types/FastifyJWT.d.ts
import "@fastify/jwt";
import type { UserRole } from "../shared/auth/UserRole.js";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            sub: string;
            email: string;
            role: UserRole;
            jti: string;
            exp?: number;
            iat?: number;
        };
        user: {
            sub: string;
            email: string;
            role: UserRole;
            jti: string;
            exp?: number;
            iat?: number;
        };
    }
}