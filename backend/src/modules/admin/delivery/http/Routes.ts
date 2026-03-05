import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ajvRef } from "../../../../shared/zod/AjvRef.js";
import { requireRole } from "../../../../shared/auth/Authz.js";

import { mapAdminError } from "./ErrorMapper.js";
import {
    CreateUserBodyZ,
    UpdateUserBodyZ,
    ListStudentsQueryZ,
    ListTeachersQueryZ,
    ImportQueryZ,
} from "./Dto.js";

import { createUserUseCase } from "../../application/CreateUserUseCase.js";
import { updateUserUseCase } from "../../application/UpdateUserUseCase.js";
import { listUsersUseCase } from "../../application/ListUsersUseCase.js";
import { setUserActiveUseCase } from "../../application/SetUserActiveUseCase.js";
import { importUsersFromExcelUseCase } from "../../application/ImportUsersFromExcelUseCase.js";

import { AdminError } from "../../domain/AdminErrors.js";
import type { AdminErrorReason } from "../../domain/AdminErrors.js";

type AdminFailStatus = 400 | 401 | 403 | 404;

function sendAdminFail(reply: any, reason: AdminErrorReason) {
    const m = mapAdminError(reason);
    return reply.code(m.status as AdminFailStatus).send({ ok: false, reason, message: m.message });
}

export async function registerAdminHttpRoutes(app: FastifyInstance) {
    const adminGuard = [app.auth.verify, requireRole("admin")];

    // NOTE: lock icon needs BOTH:
    // - route schema.security
    // - components.securitySchemes.bearerAuth in openapi components (see patch B)
    const security = [{ bearerAuth: [] as string[] }];

    // ===== LIST STUDENTS =====
    app.get(
        "/students",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "List students",
                security,

                // querystring schema via AJV (optional but recommended)
                // If bạn chưa add schema này thì bỏ dòng dưới và giữ Zod parse.
                querystring: ajvRef("AdminListStudentsQuery"),

                response: {
                    200: ajvRef("AdminPagedUsersOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const q = ListStudentsQueryZ.parse(req.query);

            const res = await listUsersUseCase(
                { userRepo: app.container.admin.userRepo },
                {
                    filter: {
                        role: "student",
                        q: q.q,
                        isActive: q.isActive,
                        mustChangePassword: q.mustChangePassword,
                        studentCode: q.studentCode,
                        studentFullName: q.studentFullName,
                        className: q.className,
                        faculty: q.faculty,
                        studentPhone: q.studentPhone,
                    },
                    page: { page: q.page, pageSize: q.pageSize, sortBy: q.sortBy, sortDir: q.sortDir },
                }
            );

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== LIST TEACHERS =====
    app.get(
        "/teachers",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "List teachers",
                security,
                querystring: ajvRef("AdminListTeachersQuery"),
                response: {
                    200: ajvRef("AdminPagedUsersOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const q = ListTeachersQueryZ.parse(req.query);

            const res = await listUsersUseCase(
                { userRepo: app.container.admin.userRepo },
                {
                    filter: {
                        role: "teacher",
                        q: q.q,
                        isActive: q.isActive,
                        mustChangePassword: q.mustChangePassword,
                        teacherCode: q.teacherCode,
                        teacherFullName: q.teacherFullName,
                        department: q.department,
                        teacherPhone: q.teacherPhone,
                    },
                    page: { page: q.page, pageSize: q.pageSize, sortBy: q.sortBy, sortDir: q.sortDir },
                }
            );

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== CREATE USER =====
    app.post(
        "/users",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "Create user",
                security,
                body: ajvRef("AdminCreateUserBody"),
                response: {
                    200: ajvRef("AdminUserOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const body = CreateUserBodyZ.parse(req.body);

            const res = await createUserUseCase(
                {
                    userRepo: app.container.admin.userRepo,
                    passwordHasher: app.container.admin.passwordHasher,
                    adminEmail: app.config.auth.adminEmail,
                },
                body
            );

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== UPDATE USER =====
    app.patch(
        "/users/:id",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "Update user",
                security,
                params: {
                    type: "object",
                    additionalProperties: false,
                    properties: { id: { type: "string", minLength: 1 } },
                    required: ["id"],
                },
                body: ajvRef("AdminUpdateUserBody"),
                response: {
                    200: ajvRef("AdminUserOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                    404: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const params = z.object({ id: z.string().min(1) }).parse(req.params);
            const body = UpdateUserBodyZ.parse(req.body);

            const res = await updateUserUseCase(
                {
                    userRepo: app.container.admin.userRepo,
                    passwordHasher: app.container.admin.passwordHasher,
                    adminEmail: app.config.auth.adminEmail,
                },
                { id: params.id, ...body }
            );

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== LOCK =====
    app.patch(
        "/users/:id/lock",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "Lock user (set isActive=false)",
                security,
                params: {
                    type: "object",
                    additionalProperties: false,
                    properties: { id: { type: "string", minLength: 1 } },
                    required: ["id"],
                },
                response: {
                    200: ajvRef("AdminSetActiveOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                    404: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const params = z.object({ id: z.string().min(1) }).parse(req.params);

            const res = await setUserActiveUseCase({ userRepo: app.container.admin.userRepo }, params.id, false);

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== UNLOCK =====
    app.patch(
        "/users/:id/unlock",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "Unlock user (set isActive=true)",
                security,
                params: {
                    type: "object",
                    additionalProperties: false,
                    properties: { id: { type: "string", minLength: 1 } },
                    required: ["id"],
                },
                response: {
                    200: ajvRef("AdminSetActiveOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                    404: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const params = z.object({ id: z.string().min(1) }).parse(req.params);

            const res = await setUserActiveUseCase({ userRepo: app.container.admin.userRepo }, params.id, true);

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );

    // ===== IMPORT EXCEL (multipart) =====
    app.post(
        "/users/import",
        {
            preHandler: adminGuard,
            schema: {
                tags: ["Admin"],
                summary: "Import users from Excel (.xlsx)",
                security,
                consumes: ["multipart/form-data"],
                querystring: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        mode: { type: "string", enum: ["createOnly", "upsert"], default: "createOnly" },
                    },
                },
                body: {
                    type: "object",
                    additionalProperties: false,
                    required: ["file"],
                    properties: {
                        file: { type: "string", format: "binary" },
                    },
                },
                response: {
                    200: ajvRef("AdminImportOkResponse"),
                    400: ajvRef("AdminFailResponse"),
                    401: ajvRef("AdminFailResponse"),
                    403: ajvRef("AdminFailResponse"),
                },
            },
        },
        async (req, reply) => {
            const { mode } = ImportQueryZ.parse(req.query);

            const file = await req.file();
            if (!file) {
                return reply.status(400).send({
                    ok: false,
                    reason: AdminError.ValidationFailed,
                    message: "Thiếu file.",
                });
            }

            const buf = await file.toBuffer();

            const res = await importUsersFromExcelUseCase(
                {
                    userRepo: app.container.admin.userRepo,
                    spreadsheetReader: app.container.admin.spreadsheetReader,
                    passwordHasher: app.container.admin.passwordHasher,
                    adminEmail: app.config.auth.adminEmail,
                },
                { buffer: buf, mode }
            );

            if (!res.ok) return sendAdminFail(reply, res.reason);
            return reply.send({ ok: true, data: res.data });
        }
    );
}