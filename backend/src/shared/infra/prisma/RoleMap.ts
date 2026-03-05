import { UserRole as PrismaUserRole } from "@prisma/client";
import type { UserRole } from "../../auth/UserRole.js";

/**
 * Shared <-> Prisma mapping.
 * - Chỉ dùng trong infra adapters.
 * - Domain/Application không được import file này.
 */
export const toPrismaRole: Record<UserRole, PrismaUserRole> = {
    admin: PrismaUserRole.admin,
    student: PrismaUserRole.student,
    teacher: PrismaUserRole.teacher,
};

export const fromPrismaRole: Record<PrismaUserRole, UserRole> = {
    [PrismaUserRole.admin]: "admin",
    [PrismaUserRole.student]: "student",
    [PrismaUserRole.teacher]: "teacher",
};