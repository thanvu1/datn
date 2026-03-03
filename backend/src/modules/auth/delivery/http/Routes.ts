import type { FastifyInstance } from "fastify";
import { ajvRef } from "../../../../shared/zod/AjvRef.js";

import {
    AuthLoginBody,
    AuthIntrospectBody,
    AuthChangePasswordBody,
} from "./Dto.js";

import { createAuthContainer } from "../../Container.js";
import { loginUseCase } from "../../application/LoginUseCase.js";
import { introspectUseCase } from "../../application/IntrospectUseCase.js";
import { changePasswordUseCase } from "../../application/ChangePasswordUseCase.js";
import { logoutUseCase } from "../../application/LogoutUseCase.js";
import { AuthError } from "../../domain/AuthErrors.js";

export async function authRoutes(app: FastifyInstance) {
    const deps = createAuthContainer(app);

    // ===== LOGIN =====
    app.post(
        "/login",
        {
            schema: {
                tags: ["Auth"],
                summary: "Login",
                body: ajvRef("AuthLoginBody"),
                response: {
                    200: ajvRef("AuthLoginOkResponse"),
                    400: ajvRef("AuthFailResponse"),
                    401: ajvRef("AuthFailResponse"),
                    403: ajvRef("AuthFailResponse"),
                    404: ajvRef("AuthFailResponse"),
                },
            },
        },
        async (request, reply) => {
            const body = AuthLoginBody.parse(request.body);

            const result = await loginUseCase(
                {
                    userRepo: deps.userRepo,
                    passwordHasher: deps.passwordHasher,
                    tokenService: deps.tokenService,
                    adminEmail: deps.adminEmail,
                },
                { email: body.email, password: body.password }
            );

            if (!result.ok) {
                const status =
                    result.reason === AuthError.InvalidCredentials ? 401 :
                        result.reason === AuthError.UserInactive ? 403 :
                            result.reason === AuthError.UserNotFound ? 404 :
                                400;

                return reply.code(status).send({ ok: false, reason: result.reason });
            }

            return reply.send(result);
        }
    );

    // ===== INTROSPECT (token -> valid boolean, always 200) =====
    app.post(
        "/introspect",
        {
            schema: {
                tags: ["Auth"],
                summary: "Introspect token",
                body: ajvRef("AuthIntrospectBody"),
                response: { 200: ajvRef("AuthIntrospectOkResponse") },
            },
        },
        async (request, reply) => {
            const body = AuthIntrospectBody.parse(request.body);
            const result = await introspectUseCase(
                { tokenService: deps.tokenService },
                { token: body.token }
            );
            return reply.send(result);
        }
    );

    // ===== ME =====
    app.get(
        "/me",
        {
            preHandler: [app.auth.verify],
            schema: {
                tags: ["Auth"],
                summary: "Get current user",
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            email: { type: "string" },
                            role: { type: "string" },
                        },
                        required: ["id", "email", "role"],
                    },
                },
            },
        },
        async (request: any) => ({ id: request.user.sub, email: request.user.email, role: request.user.role })
    );

    // ===== CHANGE PASSWORD =====
    app.post(
        "/change-password",
        {
            preHandler: [app.auth.verify],
            schema: {
                tags: ["Auth"],
                summary: "Change password",
                security: [{ bearerAuth: [] }],
                body: ajvRef("AuthChangePasswordBody"),
                response: {
                    200: ajvRef("AuthChangePasswordOkResponse"),
                    400: ajvRef("AuthFailResponse"),
                    401: ajvRef("AuthFailResponse"),
                    403: ajvRef("AuthFailResponse"),
                    404: ajvRef("AuthFailResponse"),
                },
            },
        },
        async (request: any, reply) => {
            const body = AuthChangePasswordBody.parse(request.body);
            const userId = request.user?.sub;
            if (!userId) return reply.code(401).send({ ok: false, reason: AuthError.InvalidToken });

            const result = await changePasswordUseCase(
                { userRepo: deps.userRepo, passwordHasher: deps.passwordHasher },
                { userId, oldPassword: body.oldPassword, newPassword: body.newPassword }
            );

            if (!result.ok) {
                const status =
                    result.reason === AuthError.WrongPassword ? 400 :
                        result.reason === AuthError.UserInactive ? 403 :
                            result.reason === AuthError.UserNotFound ? 404 :
                                400;

                return reply.code(status).send({ ok: false, reason: result.reason });
            }

            return reply.send(result);
        }
    );

    // ===== LOGOUT =====
    app.post(
        "/logout",
        {
            preHandler: [app.auth.verify],
            schema: {
                tags: ["Auth"],
                summary: "Logout",
                security: [{ bearerAuth: [] }],
                response: { 200: ajvRef("AuthLogoutOkResponse") },
            },
        },
        async (request: any, reply) => {
            const { jti, sub, exp } = request.user;

            // exp là seconds -> Date
            const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 7 * 24 * 3600 * 1000);

            const result = await logoutUseCase(
                { invalidTokenRepo: deps.invalidTokenRepo },
                { jti, userId: sub, expiresAt }
            );

            return reply.send(result);
        }
    );
}