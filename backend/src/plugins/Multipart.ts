import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

export const multipartPlugin = fp(async function multipartPlugin(app: FastifyInstance) {
    await app.register(multipart, {
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    });
});