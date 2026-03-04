import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "./UserRole.js";

export function requireRole(role: UserRole) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        if (!user || user.role !== role) {
            return reply.code(403).send({ error: "Forbidden" });
        }
    };
}