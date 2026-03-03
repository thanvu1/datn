import type { FastifyReply, FastifyRequest } from "fastify";

export function requireRole(role: "admin" | "student" | "teacher") {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        if (!user || user.role !== role) {
            return reply.code(403).send({ error: "Forbidden" });
        }
    };
}