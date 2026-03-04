// src/modules/auth/infra/UserRepoPrisma.ts
import type { PrismaClient } from "@prisma/client";
import type { UserRepo, UserRecord } from "../domain/AuthPorts.js";
import type { UserRole } from "../../../shared/auth/UserRole.js";

export function createUserRepoPrisma(prisma: PrismaClient): UserRepo {
    return {
        async findByEmail(email: string): Promise<UserRecord | null> {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                passwordHash: user.passwordHash,
                isActive: user.isActive,
                mustChangePassword: user.mustChangePassword,
            };
        },

        async findById(id: string): Promise<UserRecord | null> {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                passwordHash: user.passwordHash,
                isActive: user.isActive,
                mustChangePassword: user.mustChangePassword,
            };
        },

        async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash }, // không đụng mustChangePassword
            });
        },
    };
}