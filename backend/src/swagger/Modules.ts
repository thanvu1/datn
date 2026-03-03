import { AuthOpenApiModule } from "../modules/auth/delivery/http/OpenApi.js";

export const openApiModules = [
    { tag: { name: "Health", description: "Health checks" }, ajv: [], registerOpenApi() { } },
    { tag: { name: "Hello", description: "Demo" }, ajv: [], registerOpenApi() { } },
    AuthOpenApiModule,
];  