import fp from "fastify-plugin";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { FastifyInstance } from "fastify";

export const prismaPlugin = fp(async function prismaPlugin(app: FastifyInstance) {
    const pool = new pg.Pool({
        connectionString: app.config.db.url,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    await prisma.$connect();
    app.decorate("prisma", prisma);

    app.addHook("onClose", async () => {
        await prisma.$disconnect();
        await pool.end();
    });
});