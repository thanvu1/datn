import Fastify from "fastify";
import cors from "@fastify/cors";

import { config } from "./config/index.js";

import { prismaPlugin } from "./plugins/Prisma.js";
import { jwtPlugin } from "./plugins/JWT.js";
import { multipartPlugin } from "./plugins/Multipart.js";
import { swaggerPlugin } from "./plugins/Swagger.js";

import { openApiModules } from "./swagger/Modules.js";
import { registerAjvSchemas, collectTags, buildOpenApiComponents } from "./swagger/Registry.js";

import { apiV1 } from "./api/v1/index.js";
import { seedAdminIfNeeded } from "./modules/auth/infra/SeedAdmin.js";
import { createPasswordHasherBcrypt } from "./modules/auth/infra/PasswordHasherBcrypt.js";

export async function buildApp() {
    const app = Fastify({ logger: true });

    app.decorate("config", config);

    await app.register(cors, { origin: true });

    await app.register(prismaPlugin);
    await app.register(jwtPlugin);
    await app.register(multipartPlugin);

    const passwordHasher = createPasswordHasherBcrypt(10);

    const seeded = await seedAdminIfNeeded({
        prisma: app.prisma,
        passwordHasher,
        adminEmail: app.config.auth.adminEmail,
        adminPassword: app.config.auth.adminPassword,
    });

    app.log.info(
        { created: seeded.created, userId: seeded.userId, role: seeded.role },
        "Admin seed completed"
    );

    // ✅ Ajv schemas
    registerAjvSchemas(app, openApiModules);

    // ✅ Swagger plugin
    if (app.config.swagger.enabled) {
        const tags = collectTags(openApiModules);
        const components = buildOpenApiComponents(openApiModules);
        await app.register(swaggerPlugin, { tags, components });
    }

    // ✅ Register API
    await app.register(apiV1, { prefix: "/api/v1" });

    app.get("/_debug/spec", async () => {
        const s: any = app.swagger();
        return s.openapiObject ?? s; // ✅ trả doc thuần
    });

    return app;
}