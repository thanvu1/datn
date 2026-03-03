// src/types/fastify-jwt.d.ts
import "@fastify/jwt";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            sub: string;
            email: string;
            role: "admin" | "student" | "teacher";
            jti: string;
            exp?: number;
            iat?: number;
        };
        user: {
            sub: string;
            email: string;
            role: "admin" | "student" | "teacher";
            jti: string;
            exp?: number;
            iat?: number;
        };
    }
}