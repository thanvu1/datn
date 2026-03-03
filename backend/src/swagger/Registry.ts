import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import type { FastifyInstance } from "fastify";

export type OpenApiModule = {
    tag?: { name: string; description?: string };
    ajv?: any[]; // Ajv schemas with $id
    registerOpenApi?: (registry: OpenAPIRegistry) => void;
};

export function registerAjvSchemas(app: FastifyInstance, modules: OpenApiModule[]) {
    for (const mod of modules ?? []) {
        for (const s of mod.ajv ?? []) app.addSchema(s);
    }
}

export function collectTags(modules: OpenApiModule[]) {
    const out: { name: string; description?: string }[] = [];
    const seen = new Set<string>();

    for (const m of modules ?? []) {
        const name = m.tag?.name;
        if (!name) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        out.push(m.tag!);
    }
    return out;
}

export function buildOpenApiComponents(modules: OpenApiModule[]) {
    const registry = new OpenAPIRegistry();
    for (const m of modules ?? []) m.registerOpenApi?.(registry);

    const gen = new OpenApiGeneratorV3(registry.definitions);

    const doc = gen.generateDocument({
        openapi: "3.0.3",
        info: { title: "tmp", version: "0" },
    });

    return doc.components ?? {};
}