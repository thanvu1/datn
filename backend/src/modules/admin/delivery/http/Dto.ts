import { z } from "zod";
import type { UserRole } from "../../../../shared/auth/UserRole.js";

/** runtime tuple cho z.enum (đáp ứng Zod) */
export const userRoles = ["admin", "student", "teacher"] as const;
/** compile-time check để tránh lệch với type UserRole */
type _CheckUserRole = (typeof userRoles)[number] extends UserRole ? true : never;

const boolFromQuery = z
    .union([z.string(), z.boolean()])
    .transform((v) => (typeof v === "boolean" ? v : ["1", "true", "yes", "y"].includes(v.toLowerCase())))
    .optional();

const intFromQuery = (defaultValue: number) =>
    z
        .union([z.string(), z.number()])
        .transform((v) => {
            const n = typeof v === "number" ? v : Number(v);
            return Number.isFinite(n) ? n : defaultValue;
        })
        .optional();

export const createUserBodySchema = z.object({
    email: z.string().email(),
    role: z.enum(userRoles),
    password: z.string().min(6).optional().nullable(),
    isActive: z.boolean().optional(),
    mustChangePassword: z.boolean().optional(),

    student: z
        .object({
            studentCode: z.string().optional().nullable(),
            fullName: z.string().optional().nullable(),
            className: z.string().optional().nullable(),
            faculty: z.string().optional().nullable(),
            phone: z.string().optional().nullable(),
        })
        .optional(),

    teacher: z
        .object({
            teacherCode: z.string().optional().nullable(),
            fullName: z.string().optional().nullable(),
            department: z.string().optional().nullable(),
            phone: z.string().optional().nullable(),
        })
        .optional(),
});

export const updateUserParamsSchema = z.object({ id: z.string().min(1) });

export const updateUserBodySchema = z.object({
    email: z.string().email().optional(),
    role: z.enum(userRoles).optional(),
    password: z.string().min(6).optional().nullable(),
    isActive: z.boolean().optional(),
    mustChangePassword: z.boolean().optional(),

    student: z
        .object({
            studentCode: z.string().optional().nullable(),
            fullName: z.string().optional().nullable(),
            className: z.string().optional().nullable(),
            faculty: z.string().optional().nullable(),
            phone: z.string().optional().nullable(),
        })
        .optional(),

    teacher: z
        .object({
            teacherCode: z.string().optional().nullable(),
            fullName: z.string().optional().nullable(),
            department: z.string().optional().nullable(),
            phone: z.string().optional().nullable(),
        })
        .optional(),
});

export const listUsersQuerySchema = z.object({
    q: z.string().optional(),
    role: z.enum(userRoles).optional(),
    isActive: boolFromQuery,
    mustChangePassword: boolFromQuery,

    studentCode: z.string().optional(),
    studentFullName: z.string().optional(),
    className: z.string().optional(),
    faculty: z.string().optional(),
    studentPhone: z.string().optional(),

    teacherCode: z.string().optional(),
    teacherFullName: z.string().optional(),
    department: z.string().optional(),
    teacherPhone: z.string().optional(),

    page: intFromQuery(1).transform((v) => v ?? 1),
    pageSize: intFromQuery(20).transform((v) => v ?? 20),

    sortBy: z.enum(["createdAt", "email"]).optional(),
    sortDir: z.enum(["asc", "desc"]).optional(),
});

export const importUsersQuerySchema = z.object({
    mode: z.enum(["createOnly", "upsert"]).optional().transform((v) => v ?? "createOnly"),
});