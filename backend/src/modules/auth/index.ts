import type { FastifyInstance } from "fastify";
import { authRoutes } from "./delivery/http/Routes.js";

export async function registerAuthModule(app: FastifyInstance) {
    await authRoutes(app);
}