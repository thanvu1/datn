import type { PrismaClient } from "@prisma/client";
import type { InvalidTokenRepo } from "../domain/AuthPorts.js";

export function createInvalidTokenRepoPrisma(prisma: PrismaClient): InvalidTokenRepo {
    return {
        async revoke(token) {
            // idempotent: nếu đã có thì ignore
            await prisma.invalidToken.upsert({
                where: { jti: token.jti },
                create: {
                    jti: token.jti,
                    userId: token.userId ?? null,
                    expiresAt: token.expiresAt,
                },
                update: {
                    expiresAt: token.expiresAt,
                    userId: token.userId ?? null,
                },
            });
        },
    };
}