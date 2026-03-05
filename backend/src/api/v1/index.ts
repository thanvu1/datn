import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { authRoutes } from "../../modules/auth/delivery/http/Routes.js";
import { adminModule } from "../../modules/admin/index.js";

export const apiV1: FastifyPluginAsync = fp(async (app) => {
    // /api/v1/auth/*
    await app.register(authRoutes, { prefix: "/auth" });

    // /api/v1/admin/*
    await app.register(adminModule, { prefix: "/admin" });
});