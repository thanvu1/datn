export type UserRole = "admin" | "student" | "teacher";

export const userRoles = ["admin", "student", "teacher"] as const;

export function isUserRole(x: unknown): x is UserRole {
    return x === "admin" || x === "student" || x === "teacher";
}