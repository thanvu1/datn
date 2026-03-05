import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { OpenApiModule } from "../../../../swagger/Registry.js";

import {
    CreateUserBodyZ,
    UpdateUserBodyZ,
    ListStudentsQueryZ,
    ListTeachersQueryZ,
    ImportQueryZ,
    PageQueryZ,
} from "./Dto.js";

import { adminErrorReasons } from "../../domain/AdminErrorReason.js";
import { userRoles } from "../../../../shared/auth/UserRole.js";

const ajvSchemas = [
    // =========================
    // Request schemas
    // =========================
    {
        $id: "AdminCreateUserBody",
        type: "object",
        additionalProperties: false,
        properties: {
            email: { type: "string", minLength: 1 },
            role: { enum: userRoles },
            password: { type: ["string", "null"] },
            isActive: { type: "boolean" },
            mustChangePassword: { type: "boolean" },
            student: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    studentCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    className: { type: ["string", "null"] },
                    faculty: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },
            teacher: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    teacherCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    department: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },
        },
        required: ["email", "role"],
    },
    {
        $id: "AdminUpdateUserBody",
        type: "object",
        additionalProperties: false,
        properties: {
            email: { type: "string", minLength: 1 },
            role: { enum: userRoles },
            password: { type: ["string", "null"] },
            isActive: { type: "boolean" },
            mustChangePassword: { type: "boolean" },
            student: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    studentCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    className: { type: ["string", "null"] },
                    faculty: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },
            teacher: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    teacherCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    department: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },
        },
    },

    // =========================
    // Query (paging/filter)
    // =========================
    {
        $id: "AdminPageQuery",
        type: "object",
        additionalProperties: false,
        properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            pageSize: { type: "integer", minimum: 1, maximum: 200, default: 20 },
            sortBy: { enum: ["createdAt", "email"] },
            sortDir: { enum: ["asc", "desc"] },
        },
        required: ["page", "pageSize"],
    },

    // ✅ REQUIRED for Routes.ts: querystring: ajvRef("AdminListStudentsQuery")
    {
        $id: "AdminListStudentsQuery",
        type: "object",
        additionalProperties: false,
        properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            pageSize: { type: "integer", minimum: 1, maximum: 200, default: 20 },
            sortBy: { enum: ["createdAt", "email"] },
            sortDir: { enum: ["asc", "desc"] },

            q: { type: "string" },
            isActive: { type: "boolean" },
            mustChangePassword: { type: "boolean" },

            studentCode: { type: "string" },
            studentFullName: { type: "string" },
            className: { type: "string" },
            faculty: { type: "string" },
            studentPhone: { type: "string" },
        },
    },

    // ✅ REQUIRED for Routes.ts: querystring: ajvRef("AdminListTeachersQuery")
    {
        $id: "AdminListTeachersQuery",
        type: "object",
        additionalProperties: false,
        properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            pageSize: { type: "integer", minimum: 1, maximum: 200, default: 20 },
            sortBy: { enum: ["createdAt", "email"] },
            sortDir: { enum: ["asc", "desc"] },

            q: { type: "string" },
            isActive: { type: "boolean" },
            mustChangePassword: { type: "boolean" },

            teacherCode: { type: "string" },
            teacherFullName: { type: "string" },
            department: { type: "string" },
            teacherPhone: { type: "string" },
        },
    },

    // (optional) nếu bạn muốn query import cũng ajvRef được sau này
    {
        $id: "AdminImportQuery",
        type: "object",
        additionalProperties: false,
        properties: {
            mode: { type: "string", enum: ["createOnly", "upsert"], default: "createOnly" },
        },
    },

    // =========================
    // Response schemas
    // =========================
    {
        $id: "AdminFailResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: false },
            reason: { enum: adminErrorReasons },
            message: { type: "string" },
        },
        required: ["ok", "reason", "message"],
    },

    {
        $id: "AdminUserView",
        type: "object",
        additionalProperties: false,
        properties: {
            id: { type: "string" },
            email: { type: "string" },
            role: { enum: userRoles },
            isActive: { type: "boolean" },
            mustChangePassword: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },

            student: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    studentCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    className: { type: ["string", "null"] },
                    faculty: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },

            teacher: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                    teacherCode: { type: ["string", "null"] },
                    fullName: { type: ["string", "null"] },
                    department: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                },
            },
        },
        required: ["id", "email", "role", "isActive", "mustChangePassword", "createdAt"],
    },

    {
        $id: "AdminUserOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: { $ref: "#/components/schemas/AdminUserView" },
        },
        required: ["ok", "data"],
    },

    {
        $id: "AdminPagedUsersOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: {
                    items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/AdminUserView" },
                    },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    total: { type: "integer" },
                },
                required: ["items", "page", "pageSize", "total"],
            },
        },
        required: ["ok", "data"],
    },

    {
        $id: "AdminSetActiveOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: {
                    id: { type: "string" },
                    isActive: { type: "boolean" },
                },
                required: ["id", "isActive"],
            },
        },
        required: ["ok", "data"],
    },

    {
        $id: "AdminImportOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: {
                    totalRows: { type: "integer" },
                    created: { type: "integer" },
                    updated: { type: "integer" },
                    failed: { type: "integer" },
                    failures: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                row: { type: "integer" },
                                reason: { type: "string" },
                                message: { type: "string" },
                            },
                            required: ["row", "reason", "message"],
                        },
                    },
                },
                required: ["totalRows", "created", "updated", "failed", "failures"],
            },
        },
        required: ["ok", "data"],
    },
] as const;

export const AdminOpenApiModule: OpenApiModule = {
    tag: { name: "Admin", description: "Admin endpoints (students/teachers/users/import)" },
    ajv: [...ajvSchemas],
    registerOpenApi(registry: OpenAPIRegistry) {
        // Requests (Zod-to-openapi only)
        registry.register("AdminCreateUserBody", CreateUserBodyZ);
        registry.register("AdminUpdateUserBody", UpdateUserBodyZ);
        registry.register("AdminPageQuery", PageQueryZ);
        registry.register("AdminListStudentsQuery", ListStudentsQueryZ);
        registry.register("AdminListTeachersQuery", ListTeachersQueryZ);
        registry.register("AdminImportQuery", ImportQueryZ);
    },
};