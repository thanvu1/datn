// src/modules/auth/infra/SeedAdmin.ts
import type { PrismaClient } from "@prisma/client";
import type { PasswordHasher } from "../domain/AuthPorts.js";

export async function seedAdminIfNeeded(opts: {
    prisma: PrismaClient;
    passwordHasher: PasswordHasher;
    adminEmail: string;
    adminPassword: string;
}) {
    const email = String(opts.adminEmail || "").trim().toLowerCase();
    if (!email) throw new Error("ADMIN_EMAIL is missing");

    // Nếu đã có user với email này => bỏ qua
    const existing = await opts.prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true },
    });
    if (existing) {
        return { created: false as const, userId: existing.id, role: existing.role };
    }

    // Tạo mới admin
    const passwordHash = await opts.passwordHasher.hash(opts.adminPassword);

    const created = await opts.prisma.user.create({
        data: {
            email,
            role: "admin",              // Prisma enum: admin
            passwordHash,
            isActive: true,
            mustChangePassword: false,  // bạn có thể đổi thành true nếu muốn admin đổi lần đầu
        },
        select: { id: true, role: true },
    });

    return { created: true as const, userId: created.id, role: created.role };
}