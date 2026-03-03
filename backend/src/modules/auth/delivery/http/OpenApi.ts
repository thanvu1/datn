import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { OpenApiModule } from "../../../../swagger/Registry.js";

import {
    AuthLoginBody,
    AuthIntrospectBody,
    AuthChangePasswordBody,
    AuthLoginOkResponse,
    AuthFailResponse,
    AuthIntrospectOkResponse,
    AuthChangePasswordOkResponse,
    AuthLogoutOkResponse,
} from "./Dto.js";

const ajvSchemas = [
    // ===== request =====
    {
        $id: "AuthLoginBody",
        type: "object",
        additionalProperties: false,
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
        },
        required: ["email", "password"],
    },
    {
        $id: "AuthIntrospectBody",
        type: "object",
        additionalProperties: false,
        properties: { token: { type: "string", minLength: 1 } },
        required: ["token"],
    },
    {
        $id: "AuthChangePasswordBody",
        type: "object",
        additionalProperties: false,
        properties: {
            oldPassword: { type: "string", minLength: 6 },
            newPassword: { type: "string", minLength: 6 },
        },
        required: ["oldPassword", "newPassword"],
    },

    // ===== response =====
    {
        $id: "AuthLoginOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: {
                    accessToken: { type: "string" },
                    role: { enum: ["admin", "student", "teacher"] },
                    mustChangePassword: { type: "boolean" },
                },
                required: ["accessToken", "role", "mustChangePassword"],
            },
        },
        required: ["ok", "data"],
    },
    {
        $id: "AuthFailResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: false },
            reason: { type: "string" },
        },
        required: ["ok", "reason"],
    },
    {
        $id: "AuthIntrospectOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: { valid: { type: "boolean" } },
                required: ["valid"],
            },
        },
        required: ["ok", "data"],
    },
    {
        $id: "AuthChangePasswordOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: { changed: { const: true } },
                required: ["changed"],
            },
        },
        required: ["ok", "data"],
    },
    {
        $id: "AuthLogoutOkResponse",
        type: "object",
        additionalProperties: false,
        properties: {
            ok: { const: true },
            data: {
                type: "object",
                additionalProperties: false,
                properties: { loggedOut: { const: true } },
                required: ["loggedOut"],
            },
        },
        required: ["ok", "data"],
    },
] as const;

export const AuthOpenApiModule: OpenApiModule = {
    tag: { name: "Auth", description: "Authentication endpoints" },
    ajv: [...ajvSchemas],
    registerOpenApi(registry: OpenAPIRegistry) {
        // request
        registry.register("AuthLoginBody", AuthLoginBody);
        registry.register("AuthIntrospectBody", AuthIntrospectBody);
        registry.register("AuthChangePasswordBody", AuthChangePasswordBody);

        // response
        registry.register("AuthLoginOkResponse", AuthLoginOkResponse);
        registry.register("AuthFailResponse", AuthFailResponse);
        registry.register("AuthIntrospectOkResponse", AuthIntrospectOkResponse);
        registry.register("AuthChangePasswordOkResponse", AuthChangePasswordOkResponse);
        registry.register("AuthLogoutOkResponse", AuthLogoutOkResponse);
    },
};