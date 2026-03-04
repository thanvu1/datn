import type { UserRole } from "../../../shared/auth/UserRole.js";

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

    student?: StudentProfileInput;
    teacher?: TeacherProfileInput;
};

export type UpdateUserInput = {
    id: string;

    email?: string;
    role?: UserRole;
    password?: string | null;

    isActive?: boolean;
    mustChangePassword?: boolean;

    student?: StudentProfileInput;
    teacher?: TeacherProfileInput;
};

export type UserListFilter = {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
    mustChangePassword?: boolean;

    // student
    studentCode?: string;
    studentFullName?: string;
    className?: string;
    faculty?: string;
    studentPhone?: string;

    // teacher
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