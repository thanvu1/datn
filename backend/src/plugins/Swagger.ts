import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

type SwaggerPluginOpts = {
    tags?: any[];
    components?: any;
};

export const swaggerPlugin = fp(async function swaggerPlugin(
    app: FastifyInstance,
    opts: SwaggerPluginOpts = {}
) {
    const tags = opts.tags ?? [];
    const injected = opts.components ?? {};

    await app.register(swagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "Tlu Scholar Editor API",
                description: "API documentation for backend (Fastify + Prisma + JWT)",
                version: "1.0.0",
            },
            servers: [{ url: "http://localhost:3000", description: "Local development" }],
            tags,
            components: {
                securitySchemes: {
                    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
                },
            },
        },
        transformObject(doc: any) {
            doc.components ||= {};
            doc.components.schemas ||= {};

            if (injected.schemas) {
                doc.components.schemas = { ...doc.components.schemas, ...injected.schemas };
            }

            // optional: xoá def-*
            for (const k of Object.keys(doc.components.schemas)) {
                if (k.startsWith("def-")) delete doc.components.schemas[k];
            }

            return doc; // ✅ return full doc (có paths)
        },
    });

    await app.register(swaggerUI, {
        routePrefix: app.config.swagger.routePrefix ?? "/docs",
        uiConfig: { docExpansion: "list", deepLinking: false },
        staticCSP: true,
        transformStaticCSP: (h) => h,

        // ✅ quan trọng: swagger-ui phải nhận raw OpenAPI doc
        transformSpecification: (swaggerObject: any) => swaggerObject.openapiObject ?? swaggerObject,
    });
});