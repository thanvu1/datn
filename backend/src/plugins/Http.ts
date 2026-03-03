import fp from "fastify-plugin";
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from "fastify";

export const httpPlugin = fp(async (app: FastifyInstance) => {
    app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        request.log.error(error);
        reply.status(500).send({ message: "INTERNAL_ERROR" });
    });
});