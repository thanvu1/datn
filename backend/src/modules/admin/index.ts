import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { adminContainerPlugin } from "./Container.js";
import { registerAdminHttpRoutes } from "./delivery/http/Routes.js";

export const adminModule: FastifyPluginAsync = fp(async (app) => {
    await app.register(adminContainerPlugin);
    await app.register(registerAdminHttpRoutes);
});