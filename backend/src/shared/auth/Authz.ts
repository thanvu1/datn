import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "./UserRole.js";

export function requireRole(role: UserRole) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        if (!user) {
            return reply.code(401).send({
                ok: false,
                reason: "Unauthorized",
                message: "Bạn chưa đăng nhập.",
            });
        }

        if (user.role !== role) {
            return reply.code(403).send({
                ok: false,
                reason: "Forbidden",
                message: "Không có quyền truy cập.",
            });
        }
    };
}