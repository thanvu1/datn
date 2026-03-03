// src/modules/auth/Container.ts
import type { FastifyInstance } from "fastify";
import { createPasswordHasherBcrypt } from "./infra/PasswordHasherBcrypt.js";
import { createUserRepoPrisma } from "./infra/UserRepoPrisma.js";
import { createJwtTokenServiceFastify } from "./infra/JwtTokenServiceFastify.js";
import { createInvalidTokenRepoPrisma } from "./infra/InvalidTokenRepoPrisma.js";

export function createAuthContainer(app: FastifyInstance) {
    const userRepo = createUserRepoPrisma(app.prisma);
    const passwordHasher = createPasswordHasherBcrypt(10);

    const tokenService = createJwtTokenServiceFastify({
        jwt: app.jwt,
        expiresIn: app.config.auth.expiresIn,
    });

    return {
        userRepo,
        passwordHasher,
        tokenService,
        adminEmail: app.config.auth.adminEmail,
        invalidTokenRepo: createInvalidTokenRepoPrisma(app.prisma),
    };
}

export type AuthContainer = ReturnType<typeof createAuthContainer>;