import type { UserRole } from "../../../shared/auth/UserRole.js";

/**
 * =========================
 * View Models
 * =========================
 */
export type UserView = {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: Date;

    student?: {
        studentCode: string | null;
        fullName: string | null;
        className: string | null;
        faculty: string | null;
        phone: string | null;
    } | null;

    teacher?: {
        teacherCode: string | null;
        fullName: string | null;
        department: string | null;
        phone: string | null;
    } | null;
};

export type Paged<T> = {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
};

/**
 * =========================
 * Commands / Inputs
 * =========================
 */
export type StudentProfileInput = {
    studentCode?: string | null;
    fullName?: string | null;
    className?: string | null;
    faculty?: string | null;
    phone?: string | null;
};

export type TeacherProfileInput = {
    teacherCode?: string | null;
    fullName?: string | null;
    department?: string | null;
    phone?: string | null;
};

export type CreateUserInput = {
    email: string;
    role: UserRole;
    password?: string | null;

    isActive?: boolean;
    mustChangePassword?: boolean;

    student?: StudentProfileInput | null;
    teacher?: TeacherProfileInput | null;
};

export type UpdateUserInput = {
    id: string;

    email?: string;
    role?: UserRole;
    password?: string | null;

    isActive?: boolean;
    mustChangePassword?: boolean;

    student?: StudentProfileInput | null;
    teacher?: TeacherProfileInput | null;
};

/**
 * =========================
 * List Filters
 * =========================
 */
export type UserListFilter = {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
    mustChangePassword?: boolean;

    studentCode?: string;
    studentFullName?: string;
    className?: string;
    faculty?: string;
    studentPhone?: string;

    teacherCode?: string;
    teacherFullName?: string;
    department?: string;
    teacherPhone?: string;
};

export type PageQuery = {
    page: number;
    pageSize: number;
    sortBy?: "createdAt" | "email";
    sortDir?: "asc" | "desc";
};

export type ImportMode = "createOnly" | "upsert";

/**
 * =========================
 * Excel Import Domain Types
 * =========================
 */
export type ParsedUserRow = {
    row: number; // 1-based Excel row number (row 1 = header => data start row 2)
    email: string | null;
    role: UserRole | null;

    password?: string | null;

    student?: {
        studentCode?: string | null;
        fullName?: string | null;
        className?: string | null;
        faculty?: string | null;
        phone?: string | null;
    } | null;

    teacher?: {
        teacherCode?: string | null;
        fullName?: string | null;
        department?: string | null;
        phone?: string | null;
    } | null;
};

export type ParsedSpreadsheet = {
    rows: ParsedUserRow[];
    warnings: string[];
    invalidFormat: boolean;
    isEmpty: boolean;
};