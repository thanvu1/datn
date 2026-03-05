import "fastify";
import type { PrismaClient } from "@prisma/client";

declare module "fastify" {
    interface FastifyInstance {
        config: {
            api: { port: number };
            db: { url: string };
            auth: {
                jwtSecret: string;
                expiresIn: string;
                adminEmail: string;
                adminPassword: string;
            };
            swagger: { enabled: boolean; routePrefix: string };
        };

        prisma: PrismaClient;

        auth: {
            verify: (req: FastifyRequest, reply: any) => Promise<void>;
        };
        container: {
            admin: {
                userRepo: AdminUserRepo;
                spreadsheetReader: SpreadsheetReader;
                passwordHasher: PasswordHasher;
            };
        };
    }

    interface FastifyRequest {
        user?: {
            sub: string;
            email: string;
            role: "admin" | "student" | "teacher";
            jti: string;
            exp?: number;
            iat?: number;
        };
    }
}