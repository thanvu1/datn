import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { authRoutes } from "../../modules/auth/delivery/http/Routes.js";
// import { adminRoutes } from "../../modules/admin/delivery/http/Route.js";

export const apiV1: FastifyPluginAsync = fp(async (app) => {
    // /api/v1/auth/*
    await app.register(authRoutes, { prefix: "/auth" });

    // /api/v1/admin/*
    // await app.register(adminRoutes, { prefix: "/admin" });

    // /api/v1/hello
    app.get("/hello", { schema: { tags: ["Hello"], summary: "Hello" } }, async () => ({ ok: true }));
});