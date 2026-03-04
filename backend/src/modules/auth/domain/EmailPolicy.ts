// src/modules/auth/domain/EmailPolicy.ts
import type { UserRole } from "./UserRole.js";

export const studentEmailRe = /^\d{8,12}@e\.tlu\.edu\.vn$/i;
export const teacherEmailRe = /^[a-z][a-z0-9._-]{2,40}@tlu\.edu\.vn$/i;

export function normalizeEmail(email: string) {
    return String(email || "").trim().toLowerCase();
}

export function inferRoleFromEmail(email: string): Exclude<UserRole, "admin"> | null {
    const normalizedEmail = normalizeEmail(email);
    if (studentEmailRe.test(normalizedEmail)) return "student";
    if (teacherEmailRe.test(normalizedEmail)) return "teacher";
    return null;
}

export function isEmailFormatValid(email: string, adminEmail: string) {
    const normalizedEmail = normalizeEmail(email);
    return studentEmailRe.test(normalizedEmail) || teacherEmailRe.test(normalizedEmail) || normalizedEmail === normalizeEmail(adminEmail);
}

export function isAllowedEmail(email: string, adminEmail: string) {
    const normalizedEmail = normalizeEmail(email);
    return inferRoleFromEmail(normalizedEmail) !== null || normalizedEmail === normalizeEmail(adminEmail);
}