import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get("/health", {
        schema: {
            tags: ["Health"],
            summary: "Health check",
            description: "Returns server status",
            response: {
                200: {
                    type: "object",
                    properties: {
                        ok: { type: "boolean" },
                    },
                    required: ["ok"],
                },
            },
        },
    }, async () => {
        return { ok: true };
    });
}