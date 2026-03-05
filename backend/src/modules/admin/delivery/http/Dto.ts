import { z } from "zod";
import { userRoles } from "../../../../shared/auth/UserRole.js";

export const UserRoleZ = z.enum(userRoles);

/**
 * Base fields dùng chung
 */
const BaseUserFieldsZ = z.object({
    email: z.string().min(1),
    password: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    mustChangePassword: z.boolean().optional(),
});

const StudentProfileZ = z.object({
    studentCode: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    className: z.string().optional().nullable(),
    faculty: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
});

const TeacherProfileZ = z.object({
    teacherCode: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
});

/**
 * ===== CREATE: discriminatedUnion theo role =====
 */
const CreateStudentBodyZ = BaseUserFieldsZ.extend({
    role: z.literal("student"),
    student: StudentProfileZ.optional().nullable(),
    teacher: z.never().optional(),
});

const CreateTeacherBodyZ = BaseUserFieldsZ.extend({
    role: z.literal("teacher"),
    teacher: TeacherProfileZ.optional().nullable(),
    student: z.never().optional(),
});

const CreateAdminBodyZ = BaseUserFieldsZ.extend({
    role: z.literal("admin"),
    student: z.never().optional(),
    teacher: z.never().optional(),
});

export const CreateUserBodyZ = z.discriminatedUnion("role", [
    CreateStudentBodyZ,
    CreateTeacherBodyZ,
    CreateAdminBodyZ,
]);

/**
 * ===== UPDATE: 1 endpoint nhưng payload bị "chặn" đúng theo profile gửi lên =====
 * - Nếu payload có student => (role optional nhưng nếu có phải = student), cấm teacher
 * - Nếu payload có teacher => (role optional nhưng nếu có phải = teacher), cấm student
 * - Nếu payload không có profile => role optional, nhưng nếu role=admin thì cấm profile (đã thỏa)
 */
export const UpdateUserBodyZ = z.union([
    z
        .object({
            email: z.string().min(1).optional(),
            password: z.string().optional().nullable(),
            isActive: z.boolean().optional(),
            mustChangePassword: z.boolean().optional(),

            role: z.literal("student").optional(),
            student: StudentProfileZ.optional().nullable(),
            teacher: z.never().optional(),
        })
        .strict(),

    z
        .object({
            email: z.string().min(1).optional(),
            password: z.string().optional().nullable(),
            isActive: z.boolean().optional(),
            mustChangePassword: z.boolean().optional(),

            role: z.literal("teacher").optional(),
            teacher: TeacherProfileZ.optional().nullable(),
            student: z.never().optional(),
        })
        .strict(),

    z
        .object({
            email: z.string().min(1).optional(),
            password: z.string().optional().nullable(),
            isActive: z.boolean().optional(),
            mustChangePassword: z.boolean().optional(),

            role: z.literal("admin").optional(),
            student: z.never().optional(),
            teacher: z.never().optional(),
        })
        .strict(),
]);

/**
 * ===== Paging + filters =====
 */
export const PageQueryZ = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(20),
    sortBy: z.enum(["createdAt", "email"]).optional(),
    sortDir: z.enum(["asc", "desc"]).optional(),
});

export const ListUsersQueryZ = PageQueryZ.extend({
    q: z.string().optional(),
    role: UserRoleZ.optional(),
    isActive: z.coerce.boolean().optional(),
    mustChangePassword: z.coerce.boolean().optional(),

    studentCode: z.string().optional(),
    studentFullName: z.string().optional(),
    className: z.string().optional(),
    faculty: z.string().optional(),
    studentPhone: z.string().optional(),

    teacherCode: z.string().optional(),
    teacherFullName: z.string().optional(),
    department: z.string().optional(),
    teacherPhone: z.string().optional(),
});

export const ListStudentsQueryZ = PageQueryZ.extend({
    q: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    mustChangePassword: z.coerce.boolean().optional(),

    studentCode: z.string().optional(),
    studentFullName: z.string().optional(),
    className: z.string().optional(),
    faculty: z.string().optional(),
    studentPhone: z.string().optional(),
});

export const ListTeachersQueryZ = PageQueryZ.extend({
    q: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    mustChangePassword: z.coerce.boolean().optional(),

    teacherCode: z.string().optional(),
    teacherFullName: z.string().optional(),
    department: z.string().optional(),
    teacherPhone: z.string().optional(),
});

export const ImportQueryZ = z.object({
    mode: z.enum(["createOnly", "upsert"]).default("createOnly"),
});