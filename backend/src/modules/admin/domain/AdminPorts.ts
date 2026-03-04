import type { UserRole } from "../../../shared/auth/UserRole.js";
import type { CreateUserInput, UpdateUserInput, UserListFilter, PageQuery } from "./AdminTypes.js";

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

export interface AdminUserRepo {
    createUser(input: CreateUserInput, passwordHash: string | null): Promise<UserView>;
    updateUser(input: UpdateUserInput, passwordHash: string | null): Promise<UserView>;

    getUserById(id: string): Promise<UserView | null>;
    getUserByEmail(email: string): Promise<UserView | null>;

    listUsers(filter: UserListFilter, page: PageQuery): Promise<Paged<UserView>>;
}

export type SpreadsheetRowUser = CreateUserInput;

export interface SpreadsheetReader {
    parseUsersFromXlsx(buffer: Buffer): Promise<{ rows: SpreadsheetRowUser[]; warnings: string[] }>;
}

export interface PasswordHasher {
    hash(password: string): Promise<string>;
}