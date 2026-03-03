import { buildApp } from "./app.js";

const app = await buildApp();
await app.listen({ port: app.config.api.port, host: "0.0.0.0" });